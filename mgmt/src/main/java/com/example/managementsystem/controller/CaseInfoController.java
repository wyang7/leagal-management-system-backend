package com.example.managementsystem.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.IRoleService;
import com.example.managementsystem.service.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.example.managementsystem.dto.CasePageRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.managementsystem.dto.CaseCloseExtDTO;

/**
 * <p>
 * 案件表 前端控制器
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@RestController
@RequestMapping("/case")
@Slf4j
public class CaseInfoController {

    @Autowired
    private ICaseInfoService caseInfoService;

    @Autowired
    private IUserService userService;

    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;


    @Autowired
    private IRoleService roleService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 根据状态筛选案件（支持多个状态）
     */
    @GetMapping("/filter-by-status")
    public Result<List<CaseInfo>> filterCasesByStatus(
            @RequestParam List<String> statusList,
            @RequestParam Integer taskId,
            @RequestParam(required = false) String caseName, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleId() == null) {
            return Result.fail("未登录或角色信息缺失");
        }
        Long userRoleId = currentUser.getRoleId();
        Role byId = roleService.getById(userRoleId);
        if (null==byId){
            return Result.fail("角色信息异常");
        }
        String station = byId.getStation();
        return Result.success(caseInfoService.getCasesByStatusList(statusList,taskId,caseName,station));
    }

    /**
     * 查询所有案件
     */
    @GetMapping
    public Result<List<CaseInfo>> getAllCases() {
        return Result.success(caseInfoService.list());
    }

    /**
     * 根据ID查询案件
     */
    @GetMapping("/{id}")
    public Result<CaseInfo> getCaseById(@PathVariable Long id) {
        CaseInfo caseInfo = caseInfoService.getById(id);
        return caseInfo != null ? Result.success(caseInfo) : Result.fail("案件不存在");
    }
    /**
     * 分页查询案件列表 (改造为 POST + RequestBody)
     */
    @PostMapping("/page")
    public Result<Map<String, Object>> getCasePage(@RequestBody CasePageRequest request) {
        // 基础分页校验
        if (request.getPageNum() != null && request.getPageNum() < 1) { request.setPageNum(1); }
        if (request.getPageSize() != null && (request.getPageSize() < 1 || request.getPageSize() > 100)) { request.setPageSize(10); }
        Map<String, Object> pageResult = caseInfoService.getCasePage(request);
        return Result.success(pageResult);
    }

    /**
     * 更新案件关联的案件包
     */
    @PostMapping("/update-task")
    public Result<?> updateCaseTask(@RequestBody Map<String, Object> params) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        Object taskIdObj = params.get("taskId");
        Long taskId = taskIdObj != null ? Long.parseLong(taskIdObj.toString()) : null;

        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }

        caseInfo.setTaskId(taskId);
        boolean success = caseInfoService.updateById(caseInfo);
        return success ? Result.success() : Result.fail("更新案件包关联失败");
    }

    /**
     * 批量更新案件关联的案件包
     */
    @PostMapping("/batch-update-task")
    public Result<?> batchUpdateCaseTask(@RequestBody Map<String, Object> params) {
        List<Long> caseIds = (List<Long>) params.get("caseIds");
        Object taskIdObj = params.get("taskId");
        Long taskId = taskIdObj != null ? Long.parseLong(taskIdObj.toString()) : null;

        if (caseIds == null || caseIds.isEmpty()) {
            return Result.fail("请选择案件");
        }

        // 批量更新案件的任务ID
        int successCount = caseInfoService.batchUpdateTaskId(caseIds, taskId);
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("successCount", successCount);
        resultMap.put("totalCount", caseIds.size());
        return Result.success(resultMap);
    }


    // 添加：案由前缀搜索接口
    @GetMapping("/search")
    public Result<List<CaseInfo>> searchCases(@RequestParam String name) {
        // 调用服务层方法，传入前端传递的name参数
        return Result.success(caseInfoService.searchCasesByCaseNamePrefix(name));
    }
    @PostMapping("/import-excel")
    public Result<?> importCasesFromExcel(@RequestBody List<CaseInfo> caseList) {
        DateTimeFormatter fullFormatter = DateTimeFormatter.ofPattern("yyyy.M.d");
        DateTimeFormatter dbFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<String> errorMessages = new ArrayList<>(); // 记录所有错误信息

        for (CaseInfo caseInfo : caseList) {
            try {
                // 跳过空对象
                if (caseInfo == null) {
                    errorMessages.add("存在空的案件数据，已跳过");
                    continue;
                }

                String caseNumber = caseInfo.getCaseNumber() != null ? caseInfo.getCaseNumber() : "未知案件编号";

                // 校验案件助理角色
                if (StringUtils.isEmpty(caseInfo.getAssistantName())) {
                    String caseLocation = caseInfo.getCaseLocation();
                    // 校验地点为空
                    if (StringUtils.isEmpty(caseLocation)) {
                        errorMessages.add(String.format("案件编号[%s]：案件地点为空，无法自动分配助理，已跳过", caseNumber));
                        continue;
                    }

                    User assistantByCaseLocation = userService.getAssistantByCaseLocation(caseLocation);
                    if (assistantByCaseLocation != null) {
                        caseInfo.setAssistantId(assistantByCaseLocation.getUserId());
                    } else {
                        errorMessages.add(String.format("案件编号[%s]：未找到对应地点[%s]的案件助理，已跳过", caseNumber, caseLocation));
                        continue;
                    }
                } else {
                    User userByName = userService.searchUserByUsername(caseInfo.getAssistantName());
                    if (userByName == null) {
                        errorMessages.add(String.format("案件编号[%s]：案件助理[%s]不存在，已跳过", caseNumber, caseInfo.getAssistantName()));
                        continue;
                    }
                    List<String> roles = new ArrayList<>();
                    roles.add("案件助理");
                    roles.add("管理员");
                    boolean isAssistant = userService.checkUserRole(userByName.getUserId(), roles);
                    if (!isAssistant) {
                        errorMessages.add(String.format("案件编号[%s]：用户[%s]不是案件助理角色，已跳过", caseNumber, caseInfo.getAssistantName()));
                        continue;
                    }
                    caseInfo.setAssistantId(userByName.getUserId());
                }

                // 处理法院收案时间
                String courtReceiveTime = caseInfo.getCourtReceiveTime();
                LocalDate date;
                if (courtReceiveTime == null) {
                    errorMessages.add(String.format("案件编号[%s]：法院收案时间不能为空，已跳过", caseNumber));
                    continue;
                }

                try {
                    if (courtReceiveTime.matches("^\\d{4}\\.\\d{1,2}\\.\\d{1,2}$")) {
                        date = LocalDate.parse(courtReceiveTime, fullFormatter);
                    } else if (courtReceiveTime.matches("^\\d{1,2}\\.\\d{1,2}$")) {
                        int year = LocalDate.now().getYear();
                        date = LocalDate.parse(year + "." + courtReceiveTime, fullFormatter);
                    } else {
                        errorMessages.add(String.format("案件编号[%s]：法院收案时间格式错误[%s]，正确格式为yyyy.M.d或M.d，已跳过", caseNumber, courtReceiveTime));
                        continue;
                    }
                    // 生成案件号（如果为空）
                    if (caseInfo.getCaseNumber() == null) {
                        String generatedNumber = caseInfoService.genCaseNumber(courtReceiveTime);
                        caseInfo.setCaseNumber(generatedNumber);
                        caseNumber = generatedNumber; // 更新案件号变量
                    }
                    caseInfo.setCourtReceiveTime(date.format(dbFormatter));
                } catch (DateTimeParseException e) {
                    errorMessages.add(String.format("案件编号[%s]：法院收案时间解析失败[%s]，已跳过", caseNumber, courtReceiveTime));
                    continue;
                }

                // 设置默认值
                caseInfo.setStatus("待领取");
                caseInfo.setCreatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                // 保存数据
                caseInfoService.save(caseInfo);

            } catch (Exception e) {
                // 捕获所有未预料到的异常
                String caseNumber = caseInfo.getCaseNumber() != null ? caseInfo.getCaseNumber() : "未知案件编号";
                errorMessages.add(String.format("案件编号[%s]：发生未知错误[%s]，已跳过", caseNumber, e.getMessage()));
                // 打印异常堆栈便于调试
                e.printStackTrace();
                log.error("导入案件异常，案件编号[{}]，异常信息：{}", caseInfo.getCaseNumber(), e.getMessage());
            }
        }

        // 返回结果处理
        if (!errorMessages.isEmpty()) {
            return Result.fail("部分案件导入失败，详情如下：\n" + String.join("\n", errorMessages));
        } else {
            return Result.success("所有案件导入成功");
        }
    }

    /**
     * 新增案件
     */
    @PostMapping
    public Result<?> addCase(@RequestBody CaseInfo caseInfo) {

        // 校验案件助理角色
        if (caseInfo.getAssistantId() != null) {
            List<String> roles = new ArrayList<>();
            roles.add("案件助理");
            roles.add("管理员");
            boolean isAssistant = userService.checkUserRole(caseInfo.getAssistantId(), roles);
            if (!isAssistant) {
                return Result.fail("所选用户不是案件助理角色");
            }
        }else {
            String caseLocation = caseInfo.getCaseLocation();
            User assistantByCaseLocation = userService.getAssistantByCaseLocation(caseLocation);
            if (assistantByCaseLocation != null) {
                caseInfo.setAssistantId(assistantByCaseLocation.getUserId());
            }
        }
        if (caseInfo.getCourtReceiveTime() == null) {
            return Result.fail("法院收案时间不能为空");
        }

        if (StringUtils.isEmpty(caseInfo.getCaseNumber())) {
            caseInfo.setCaseNumber(caseInfoService.genCaseNumber(caseInfo.getCourtReceiveTime().replace("-",".")));
        }

        // 新增案件默认状态为"待领取"
        if (caseInfo.getStatus() == null || caseInfo.getStatus().isEmpty()) {
            caseInfo.setStatus("待领取");
        }
        boolean success = caseInfoService.save(caseInfo);
        return success ? Result.success() : Result.fail("新增案件失败");
    }

    /**
     * 批量分派案件
     */
    @PostMapping("/batch-assign")
    public Result<?> batchAssignCases(@RequestBody Map<String, Object> params, HttpSession session) {
        List<Integer> intCaseIds = (List<Integer>) params.get("caseIds");
        // 手动转换为List<Long>
        List<Long> caseIds = intCaseIds.stream()
                .map(Integer::longValue) // 每个Integer转为Long
                .collect(Collectors.toList());
        Long userId = Long.parseLong(params.get("userId").toString());

        if (caseIds == null || caseIds.isEmpty()) {
            return Result.fail("请选择要分派的案件");
        }
        if (userId == null || userId <= 0) {
            return Result.fail("请选择负责人");
        }
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        List<Long> failedCases = new ArrayList<>();
        caseIds.forEach(caseId -> {
            Long operatorId = currentUser.getUserId();
            String operatorName = currentUser.getUsername();
            CaseInfo caseById = caseInfoService.getCaseById(caseId);
            if (caseById == null) {
                failedCases.add(operatorId);
                return;
            }
            boolean success = caseInfoService.receiveCase(caseId, userId,true);
            if (success) {
                // 保存历史记录
                caseFlowHistoryService.saveHistory(
                        caseId,
                        operatorId,
                        operatorName,
                        "领取案件",
                        caseById.getStatus(),
                        "已领取",
                        ""
                );
            }else  {
                failedCases.add(caseId);
            }
        });
        boolean success = failedCases.isEmpty();
        return success ? Result.success() : Result.fail("批量分派失败：部分案件分派失败，案件ID列表：" + failedCases);
    }

    /**
     * 更新案件
     */
    @PutMapping
    public Result<?> updateCase(@RequestBody CaseInfo caseInfo) {

        boolean success = caseInfoService.updateById(caseInfo);
        return success ? Result.success() : Result.fail("更新案件失败");
    }
    /**
     * 更新案件
     */
    @PutMapping("/remove-task")
    public Result<?> removeCaseTaskId(@RequestBody CaseInfo caseInfo) {

        int success = caseInfoService.removeTaskId(caseInfo.getCaseId());
        return success>0 ? Result.success() : Result.fail("更新案件失败");
    }

    /**
     * 获取案件详情（包含完成情况）
     */
    @GetMapping("/detail/{id}")
    public Result<CaseInfo> getCaseDetail(@PathVariable Long id) {
        CaseInfo caseInfo = caseInfoService.getCaseById(id);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        return Result.success(caseInfo);
    }

    /**
     * 退回案件（包含退回原因）
     */
    @PostMapping("/return")
    public Result<?> returnCase(@RequestBody Map<String, Object> params, HttpSession session) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String returnReason = params.get("returnReason").toString();

        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();

        if (StringUtils.isEmpty(returnReason)) {
            return Result.fail("请输入退回原因");
        }
        CaseInfo caseById = caseInfoService.getCaseById(caseId);
        if (caseById == null) {
            return Result.fail("案件不存在");
        }
//        LocalDateTime receiveTime = caseById.getReceiveTime();
//        if (receiveTime != null &&
//                (System.currentTimeMillis()-receiveTime.atZone(ZoneId.of("UTC")).toInstant().toEpochMilli() < 24*60*60*1000)) {
//            return Result.fail("案件不允许在领取后24小时之内退回");
//        }
        // 记录原状态
        String beforeStatus = caseById.getStatus();
        boolean success = caseInfoService.returnCase(caseId, returnReason);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "退回案件",
                    beforeStatus,
                    "退回", // 退回后的状态
                    returnReason
            );
            return Result.success();
        } else {
            return Result.fail("退回案件失败，案件状态不是已领取");
        }
    }

    /**
     * 案件反馈接口
     * 接收案件ID和反馈内容，更新状态为反馈
     */
    @PostMapping("/pre-feedback")
    public Result<?> preFeedbackCase(@RequestBody Map<String, Object> params, HttpSession session) {
        // 解析请求参数
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String preFeedback = params.get("preFeedback").toString();

        // 校验案件是否存在
        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();

        // 校验状态是否为已领取（只能从已领取状态流转到反馈）
        if (!"已领取".equals(caseInfo.getStatus())&& !"反馈".equals(caseInfo.getStatus())) {
            return Result.fail("只有已领取的案件可以提交反馈");
        }
        String beforeStatus = caseInfo.getStatus();
        // 更新案件信息
        caseInfo.setStatus("反馈"); // 变更状态为反馈
        //修改反馈结构
        String finalPreFeedback = buildAccumulatedRemark(caseInfo.getPreFeedback(), preFeedback, operatorId);
        caseInfo.setPreFeedback(finalPreFeedback); // 存储反馈内容
        caseInfo.setUpdatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))); // 更新时间



        boolean success = caseInfoService.updateById(caseInfo);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "案件反馈",
                    beforeStatus,
                    "反馈",
                    preFeedback
            );
            return Result.success();
        } else {
            return Result.fail("反馈提交失败");
        }
    }

    /**
     * 案件延期接口
     * 接收案件ID和延期原因，从已领取或反馈状态流转到延期状态
     */
    @PostMapping("/delay")
    public Result<?> delayCase(@RequestBody Map<String, Object> params, HttpSession session) {
        // 解析请求参数
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String delayReason = params.get("delayReason").toString();

        // 校验案件是否存在
        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }

        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();

        // 校验状态是否为已领取或反馈（只能从这两个状态流转到延期）
        String currentStatus = caseInfo.getStatus();
        if (!"已领取".equals(currentStatus) && !"反馈".equals(currentStatus)) {
            return Result.fail("只有已领取或反馈的案件可以申请延期");
        }
        String beforeStatus = caseInfo.getStatus();
        // 更新案件信息
        caseInfo.setStatus("延期"); // 变更状态为延期
        String finalDelayReason = buildAccumulatedRemark(caseInfo.getDelayReason(), delayReason, operatorId);
        caseInfo.setDelayReason(finalDelayReason); // 存储延期原因
        caseInfo.setUpdatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))); // 更新时间

        boolean success = caseInfoService.updateById(caseInfo);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "案件延期申请",
                    beforeStatus,
                    "延期",
                    delayReason
            );
            return Result.success();
        } else {
            return Result.fail("延期申请提交失败");
        }
    }

    /**
     * 删除案件
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteCase(@PathVariable Long id) {
        boolean success = caseInfoService.removeById(id);
        return success ? Result.success() : Result.fail("删除案件失败");
    }

    /**
     * 分派案件
     */
    @PostMapping("/assign")
    public Result<?> assignCase(@RequestBody Map<String, Object> params, HttpSession session) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());

        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();
        CaseInfo caseById = caseInfoService.getCaseById(caseId);

        boolean success = caseInfoService.receiveCase(caseId, userId,true);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "领取案件",
                    caseById.getStatus(),
                    "已领取",
                    ""
            );
            return Result.success();
        } else {
            return Result.fail("分派案件失败，案件状态不是待领取或当前已到达领取上限");
        }
    }
    /**
     * 领取案件
     */
    @PostMapping("/receive")
    public Result<?> receiveCase(@RequestBody Map<String, Object> params, HttpSession session) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());

        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();


        CaseInfo caseById = caseInfoService.getCaseById(caseId);
        if (caseById == null||!"待领取".equals(caseById.getStatus())) {
            return Result.fail("案件不存在或不是待领取状态");
        }
        String beforeStatus = caseById.getStatus();
        boolean success = caseInfoService.receiveCase(caseId, userId,false);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "领取案件",
                    beforeStatus,
                    "已领取",
                    ""
            );
            return Result.success();
        } else {
            return Result.fail("领取案件失败，当前已到达领取上限");
        }
    }

    /**
     * 更新案件状态
     */
    @PostMapping("/update-status")
    public Result<?> updateCaseStatus(@RequestBody Map<String, Object> params, HttpSession session) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String status = params.get("status").toString();
        String remark = params.getOrDefault("remark", "").toString();
        boolean success = caseInfoService.updateCaseStatus(caseId, status);
        // 写入案件操作历史
        if (success && "结案".equals(status)) {
            UserSession currentUser = (UserSession) session.getAttribute("currentUser");
            Long operatorId = currentUser != null ? currentUser.getUserId() : null;
            caseInfoService.addCaseHistory(caseId, "结案", status, remark, operatorId);
        }
        return success ? Result.success() : Result.fail("更新案件状态失败");
    }


    /**
     * 获取当前用户的案件
     */
    @GetMapping("/assistant-cases")
    public Result<List<CaseInfo>> getAssistantCases(@RequestParam Long userId) {
        return Result.success(caseInfoService.getAssistantCases(userId));
    }

    /**
     * 完成案件（包含完成情况）
     */
    @PostMapping("/complete-with-notes")
    public Result<?> completeCaseWithNotes(@RequestBody Map<String, Object> params, HttpSession session) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String notes = params.get("notes").toString();
        // 扩展字段提取
        String signDate = (String) params.getOrDefault("signDate", null);
        Object adjustedAmountObj = params.get("adjustedAmount");
        Object mediationFeeObj = params.get("mediationFee");
        String payer = (String) params.getOrDefault("payer", null);
        Boolean invoiced = params.get("invoiced") == null ? null : Boolean.valueOf(params.get("invoiced").toString());
        String invoiceInfo = (String) params.getOrDefault("invoiceInfo", null);
        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();
        // 状态校验：仅已领取/反馈/延期可以提交结案审核
        String before = caseInfo.getStatus();
        if (!("已领取".equals(before) || "反馈".equals(before) || "延期".equals(before))) {
            return Result.fail("当前状态不允许提交结案审核");
        }

        // 自动生成澎和案件号（仅司法确认且为空）
        if (("司法确认".equals(notes)||"其他".equals(notes)|| "民初".equals(notes)) && caseInfo.getPengheCaseNumber() == null) {
            Integer maxPenghe = caseInfoService.getMaxPengheCaseNumber();
            int nextPenghe = (maxPenghe == null || maxPenghe < 689) ? 689 : maxPenghe + 1;
            caseInfo.setPengheCaseNumber(nextPenghe);
        }
        // 构造扩展 DTO（默认调成标的额用原值）
        CaseCloseExtDTO ext = new CaseCloseExtDTO();
        ext.setSignDate(signDate);
        try {
            if (adjustedAmountObj != null) {
                ext.setAdjustedAmount(new java.math.BigDecimal(adjustedAmountObj.toString()));
            } else if (caseInfo.getAmount() != null) {
                ext.setAdjustedAmount(caseInfo.getAmount());
            }
            if (mediationFeeObj != null) {
                ext.setMediationFee(new java.math.BigDecimal(mediationFeeObj.toString()));
            }
        } catch (NumberFormatException e) {
            return Result.fail("金额格式错误");
        }
        // 自动生成收款单号（若为空）
        BigDecimal mediationFee = ext.getMediationFee();
        if (caseInfo.getReceiptNumber() == null && mediationFee != null && mediationFee.intValue() > 0) {
            if ("本部".equals(caseInfo.getCaseLocation())) {
                String maxReceipt = caseInfoService.getMaxReceiptNumberForBenbu();
                String nextReceipt = "S069";
                if (maxReceipt != null && maxReceipt.startsWith("S0")) {
                    try {
                        int num = Integer.parseInt(maxReceipt.substring(2));
                        nextReceipt = String.format("S0%02d", num + 1);
                    } catch (NumberFormatException ignored) {}
                }
                caseInfo.setReceiptNumber(nextReceipt);
            } else {
                Integer maxReceipt = caseInfoService.getMaxReceiptNumber();
                int nextReceipt = (maxReceipt == null || maxReceipt < 818) ? 818 : maxReceipt + 1;
                caseInfo.setReceiptNumber(String.valueOf(nextReceipt));
            }
        }
        ext.setPayer(payer);
        ext.setInvoiced(invoiced);
        if (Boolean.TRUE.equals(invoiced)) {
            ext.setInvoiceInfo(invoiceInfo);
        }
        try {
            caseInfo.setCaseCloseExt(objectMapper.writeValueAsString(ext));
        } catch (Exception e) {
            return Result.fail("结案扩展信息序列化失败");
        }
        // 更新状态与完成情况
        caseInfo.setStatus("待结案");
        String finalNotes = buildAccumulatedRemark(caseInfo.getCompletionNotes(), notes, operatorId);
        caseInfo.setCompletionNotes(finalNotes);
        caseInfo.setUpdatedTime(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        boolean success = caseInfoService.updateById(caseInfo);
        if (success) {
            caseFlowHistoryService.saveHistory(caseId, operatorId, operatorName, "提交结案审核", before, "待结案", notes);
            return Result.success();
        } else {
            return Result.fail("提交结案审核失败");
        }
    }

    // 添加调解失败案件的接口
    @PostMapping("/complete")
    public Result<?> completeCase(@RequestBody CaseInfo caseInfo, HttpSession session) {
        CaseInfo existingCase = caseInfoService.getById(caseInfo.getCaseId());
        if (existingCase == null) {
            return Result.fail("案件不存在");
        }
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();

        String finalCompletionRemark = buildAccumulatedRemark(existingCase.getCompletionRemark(), caseInfo.getCompletionRemark(), operatorId);
        boolean success = caseInfoService.completeCase(caseInfo.getCaseId(), finalCompletionRemark, caseInfo.getReturnCourtTime(), operatorId);
        return success ? Result.success() : Result.fail("提交调解失败案件失败");
    }

    /**
     * 批量更新退回法院时间
     */
    @PostMapping("/batch-update-return-court-time")
    public Result<?> batchUpdateReturnCourtTime(@RequestBody Map<String, Object> params) {
        List<Long> caseIds = (List<Long>) params.get("caseIds");
        String returnCourtTime = (String) params.get("returnCourtTime");
        if (caseIds == null || caseIds.isEmpty() || returnCourtTime == null || returnCourtTime.isEmpty()) {
            return Result.fail("参数错误");
        }
        int successCount = caseInfoService.batchUpdateReturnCourtTime(caseIds, returnCourtTime);
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("successCount", successCount);
        resultMap.put("totalCount", caseIds.size());
        return Result.success(resultMap);
    }




    private String buildAccumulatedRemark(String existingRemark, String newRemark, Long operatorId) {
        // 获取当前时间
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        // 获取操作人姓名
        User operator = userService.getById(operatorId);
        String operatorName = operator != null ? operator.getUsername() : "未知用户";

        // 构建新记录行
        String newRecord = String.format("%s，%s，填写反馈备注：%s", currentTime, operatorName, newRemark);

        // 累积记录（如果已有记录则换行添加，否则直接使用新记录）
        return StringUtils.isEmpty(existingRemark) ? newRecord : existingRemark + "\n" + newRecord;
    }

    /**
     * 导出案件（支持勾选或当前查询条件）
     */
    @PostMapping("/export")
    public void exportCases(@RequestBody Map<String, Object> params, HttpServletResponse response) {
        try {
            List<CaseInfo> exportList;
            if (params.containsKey("caseIds")) {
                List<Integer> intIds = (List<Integer>) params.get("caseIds");
                List<Long> caseIds = intIds.stream().map(Integer::longValue).collect(Collectors.toList());
                exportList = caseInfoService.listByIds(caseIds);
            } else {
                CasePageRequest request = new CasePageRequest();
                request.setCaseName((String) params.get("caseName"));
                request.setCaseNumber((String) params.get("caseNumber"));
                request.setPlaintiff((String) params.get("plaintiff"));
                request.setDefendant((String) params.get("defendant"));
                request.setUserName((String) params.get("userName"));
                request.setAssistant((String) params.get("assistant"));
                request.setReceiveTimeStart((String) params.get("receiveTimeStart"));
                request.setReceiveTimeEnd((String) params.get("receiveTimeEnd"));
                request.setStatus((String) params.get("status"));
                request.setStation((String) params.get("station"));
                request.setKeyword((String) params.getOrDefault("keyword", null));
                request.setPageNum(1); request.setPageSize(10000);
                Map<String, Object> pageResult = caseInfoService.getCasePage(request);
                exportList = (List<CaseInfo>) pageResult.get("records");
            }

            // 3. 字段去重合并（详情+列表字段）
            String[] headers = {
                "案件号", "案由", "标的额", "案件归属地", "原告", "被告", "法官", "案件助理", "领取时间", "退回法院时间",
                "状态", "处理人", "法院收案时间", "反馈情况", "退回情况", "案件完成情况", "调解失败备注", "关联案件包"
            };

            // 4. 创建Excel
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("案件导出");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (CaseInfo c : exportList) {
                Row row = sheet.createRow(rowIdx++);
                int col = 0;
                row.createCell(col++).setCellValue(c.getCaseNumber() == null ? "" : c.getCaseNumber());
                row.createCell(col++).setCellValue(c.getCaseName() == null ? "" : c.getCaseName());
                row.createCell(col++).setCellValue(c.getAmount() == null ? 0 : c.getAmount().doubleValue());
                row.createCell(col++).setCellValue(c.getCaseLocation() == null ? "" : c.getCaseLocation());
                row.createCell(col++).setCellValue(c.getPlaintiffName() == null ? "" : c.getPlaintiffName());
                row.createCell(col++).setCellValue(c.getDefendantName() == null ? "" : c.getDefendantName());
                row.createCell(col++).setCellValue(c.getJudge() == null ? "" : c.getJudge());
                row.createCell(col++).setCellValue(c.getAssistantName() == null ? "" : c.getAssistantName());
                row.createCell(col++).setCellValue(c.getReceiveTime() == null ? "" : c.getReceiveTime().toString());
                row.createCell(col++).setCellValue(c.getReturnCourtTime() == null ? "" : c.getReturnCourtTime());
                row.createCell(col++).setCellValue(c.getStatus() == null ? "" : c.getStatus());
                row.createCell(col++).setCellValue(c.getUsername() == null ? "" : c.getUsername());
                row.createCell(col++).setCellValue(c.getCourtReceiveTime() == null ? "" : c.getCourtReceiveTime());
                row.createCell(col++).setCellValue(c.getPreFeedback() == null ? "" : c.getPreFeedback());
                row.createCell(col++).setCellValue(c.getReturnReason() == null ? "" : c.getReturnReason());
                row.createCell(col++).setCellValue(c.getCompletionNotes() == null ? "" : c.getCompletionNotes());
                row.createCell(col++).setCellValue(c.getCompletionRemark() == null ? "" : c.getCompletionRemark());
                row.createCell(col++).setCellValue(c.getTaskName() == null ? "" : c.getTaskName());
            }
            // 自动列宽
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            // 5. 响应下载
            String filename = "案件导出_" + java.time.LocalDate.now() + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=" + java.net.URLEncoder.encode(filename, "UTF-8"));
            workbook.write(response.getOutputStream());
            response.flushBuffer(); // 确保数据全部写出
            workbook.close();
        } catch (Exception e) {
            // 不能向response写入任何非二进制内容，否则会破坏Excel文件
            // 仅记录日志
            e.printStackTrace();
        }
    }

    /**
     * 导出当前用户所有案件
     */
    @PostMapping("/export-my-cases")
    public void exportMyCases(@RequestBody Map<String, Object> params, HttpServletResponse response) {
        Long userId = null;
        if (params.containsKey("userId")) {
            Object idObj = params.get("userId");
            if (idObj instanceof Number) {
                userId = ((Number) idObj).longValue();
            } else if (idObj instanceof String) {
                try {
                    userId = Long.parseLong((String) idObj);
                } catch (NumberFormatException ignored) {}
            }
        }
        if (userId == null) {
            response.setStatus(400);
            return;
        }
        List<CaseInfo> myCases = caseInfoService.getCasesByUserId(userId);
        // 过滤掉调解失败和退回状态的案件
        myCases = myCases.stream()
                .filter(c -> !"调解失败".equals(c.getStatus()) && !"退回".equals(c.getStatus()))
                .collect(Collectors.toList());
        String[] headers = {
            "案件号", "案由", "标的额", "案件归属地", "原告", "被告", "法官", "案件助理", "领取时间", "退回法院时间",
            "状态", "处理人", "法院收案时间", "反馈情况", "退回情况", "案件完成情况"
        };
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("我的案件导出");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (CaseInfo c : myCases) {
                Row row = sheet.createRow(rowIdx++);
                int col = 0;
                row.createCell(col++).setCellValue(c.getCaseNumber() == null ? "" : c.getCaseNumber());
                row.createCell(col++).setCellValue(c.getCaseName() == null ? "" : c.getCaseName());
                row.createCell(col++).setCellValue(c.getAmount() == null ? 0 : c.getAmount().doubleValue());
                row.createCell(col++).setCellValue(c.getCaseLocation() == null ? "" : c.getCaseLocation());
                row.createCell(col++).setCellValue(c.getPlaintiffName() == null ? "" : c.getPlaintiffName());
                row.createCell(col++).setCellValue(c.getDefendantName() == null ? "" : c.getDefendantName());
                row.createCell(col++).setCellValue(c.getJudge() == null ? "" : c.getJudge());
                // 案件助理中文名
                String assistantName = "";
                if (c.getAssistantId() != null) {
                    User assistant = userService.getById(c.getAssistantId());
                    if (assistant != null) assistantName = assistant.getUsername();
                }
                row.createCell(col++).setCellValue(assistantName);
                row.createCell(col++).setCellValue(c.getReceiveTime() == null ? "" : c.getReceiveTime().toString());
                row.createCell(col++).setCellValue(c.getReturnCourtTime() == null ? "" : c.getReturnCourtTime());
                row.createCell(col++).setCellValue(c.getStatus() == null ? "" : c.getStatus());
                // 处理人中文名
                String username = "";
                if (c.getUserId() != null) {
                    User user = userService.getById(c.getUserId());
                    if (user != null) username = user.getUsername();
                }
                row.createCell(col++).setCellValue(username);
                row.createCell(col++).setCellValue(c.getCourtReceiveTime() == null ? "" : c.getCourtReceiveTime());
                row.createCell(col++).setCellValue(c.getPreFeedback() == null ? "" : c.getPreFeedback());
                row.createCell(col++).setCellValue(c.getReturnReason() == null ? "" : c.getReturnReason());
                row.createCell(col++).setCellValue(c.getCompletionNotes() == null ? "" : c.getCompletionNotes());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            String filename = "我的案件导出_" + java.time.LocalDate.now() + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=" + java.net.URLEncoder.encode(filename, "UTF-8"));
            workbook.write(response.getOutputStream());
            response.flushBuffer();
            workbook.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 批量调解失败接口
     * 接收案件ID列表和备注，批量更新状态为失败并写入操作历史。
     */
    @PostMapping("/batch-failed")
    public Result<?> batchFailed(@RequestBody Map<String, Object> params, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        List<Integer> caseIds = (List<Integer>) params.get("caseIds");
        String completionRemark = (String) params.get("completionRemark");
        if (caseIds == null || caseIds.isEmpty()) {
            return Result.fail("未选中案件");
        }
        int count = caseInfoService.batchUpdateStatus(caseIds, "调解失败", completionRemark,operatorId);
        return Result.success(count);
    }

    /**
     * 批量结案接口
     */
    @PostMapping("/batch-close")
    public Result<?> batchCloseCases(@RequestBody Map<String, Object> params, HttpSession session) {
        List<Integer> intCaseIds = (List<Integer>) params.get("caseIds");
        List<Long> caseIds = intCaseIds.stream().map(Integer::longValue).collect(Collectors.toList());
        String remark = params.getOrDefault("completionRemark", "").toString();
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        Long operatorId = currentUser != null ? currentUser.getUserId() : null;
        int successCount = 0;
        for (Long caseId : caseIds) {
            boolean success = caseInfoService.updateCaseStatus(caseId, "结案");
            if (success) {
                caseInfoService.addCaseHistory(caseId, "结案", "结案", remark, operatorId);
                successCount++;
            }
        }
        if (successCount == caseIds.size()) {
            return Result.success();
        } else {
            return Result.fail("部分案件结案失败，成功结案数：" + successCount + "/" + caseIds.size());
        }
    }
}
