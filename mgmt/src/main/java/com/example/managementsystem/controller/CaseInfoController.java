package com.example.managementsystem.controller;

import com.example.managementsystem.adapter.OssFileStorageAdapter;
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
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;
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
     * 根据状态筛选案件（支持多个状态），按当前登录用户的角色驻点过滤
     */
    @GetMapping("/filter-by-status")
    public Result<List<CaseInfo>> filterCasesByStatus(
            @RequestParam List<String> statusList,
            @RequestParam Integer taskId,
            @RequestParam(required = false) String caseName,
            HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || !StringUtils.hasText(currentUser.getRoleIds())) {
            return Result.fail("未登录或角色信息缺失");
        }
        // 取第一个角色ID作为驻点判定的基础（与 workspace 中 getAdminStations 一致）
        String[] roleIdArray = currentUser.getRoleIds().split(",");
        if (roleIdArray.length == 0 || !StringUtils.hasText(roleIdArray[0])) {
            return Result.fail("角色信息缺失");
        }
        Long firstRoleId;
        try {
            firstRoleId = Long.parseLong(roleIdArray[0].trim());
        } catch (NumberFormatException e) {
            return Result.fail("角色信息格式错误");
        }
        Role role = roleService.getById(firstRoleId);
        if (role == null) {
            return Result.fail("角色信息异常");
        }
        String station = role.getStation();
        List<CaseInfo> list = caseInfoService.getCasesByStatusList(statusList, taskId, caseName, station);
        return Result.success(list);
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
    public Result<?> getCaseDetail(@PathVariable Long id) {
        CaseInfo caseInfo = caseInfoService.getCaseById(id);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        // 根据驻点动态返回青枫号/澎和号展示字段
        Map<String, Object> resp = new HashMap<>();
        resp.put("case", caseInfo);
        String caseLocation = caseInfo.getCaseLocation();
        String number = caseInfo.getPengheCaseNumber();
        if (number != null) {
            if ("四季青".equals(caseLocation)) {
                resp.put("label", "青枫案件号：");
            } else {
                resp.put("label", "澎和案件号：");
            }
            resp.put("number", number);
        }
        return Result.success(resp);
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
        if (!"已领取".equals(caseInfo.getStatus())&& !"反馈".equals(caseInfo.getStatus())&& !"延期".equals(caseInfo.getStatus())) {
            return Result.fail("只有已领取的案件可以提交反馈");
        }
        String beforeStatus = caseInfo.getStatus();
        // 更新案件信息
        caseInfo.setStatus("延期".equals(caseInfo.getStatus())?"延期":"反馈"); // 变更状态为反馈
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
        Object plaintiffMediationFeeObj = params.get("plaintiffMediationFee");
        Object defendantMediationFeeObj = params.get("defendantMediationFee");
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

        // 自动生成青枫号/澎和号（仅司法确认/其他/民初且为空），两套序列互相独立
        if (("司法确认".equals(notes) || "其他".equals(notes) || "民初".equals(notes))
                && caseInfo.getPengheCaseNumber() == null) {
            String caseLocation = caseInfo.getCaseLocation();
            int currentYear = java.time.LocalDate.now().getYear();
            String prefix = currentYear + "-"; // 例如 2026-
            String nextNumberStr;
            if ("四季青".equals(caseLocation)) {
                // 青枫号：仅统计当前年份、四季青的最大号，从 001 开始
                String maxQingfeng = caseInfoService.getMaxQingfengCaseNumberForYear(prefix);
                if (maxQingfeng == null || !maxQingfeng.startsWith(prefix)) {
                    nextNumberStr = prefix + "001";
                } else {
                    String seqPart = maxQingfeng.substring(prefix.length());
                    int seq;
                    try {
                        seq = Integer.parseInt(seqPart);
                    } catch (NumberFormatException e) {
                        // 历史或异常数据格式，视为无记录，从 001 开始
                        seq = 0;
                    }
                    nextNumberStr = String.format("%s%03d", prefix, seq + 1);
                }
            } else {
                // 澎和号：仅统计当前年份、非四季青的最大号，从 001 开始
                String maxPenghe = caseInfoService.getMaxPengheCaseNumberForYear(prefix);
                if (maxPenghe == null || !maxPenghe.startsWith(prefix)) {
                    nextNumberStr = prefix + "001";
                } else {
                    String seqPart = maxPenghe.substring(prefix.length());
                    int seq;
                    try {
                        seq = Integer.parseInt(seqPart);
                    } catch (NumberFormatException e) {
                        seq = 0;
                    }
                    nextNumberStr = String.format("%s%03d", prefix, seq + 1);
                }
            }
            caseInfo.setPengheCaseNumber(nextNumberStr);
        }
        // 构造扩展 DTO
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
            if (plaintiffMediationFeeObj != null) {
                ext.setPlaintiffMediationFee(new java.math.BigDecimal(plaintiffMediationFeeObj.toString()));
            }
            if (defendantMediationFeeObj != null) {
                ext.setDefendantMediationFee(new java.math.BigDecimal(defendantMediationFeeObj.toString()));
            }
        } catch (NumberFormatException e) {
            return Result.fail("金额格式错误");
        }
        // 计算用于生成收款单号的调解费总额
        BigDecimal mediationFeeForReceipt = ext.getMediationFee();
        if (mediationFeeForReceipt == null && ext.getPlaintiffMediationFee() != null && ext.getDefendantMediationFee() != null) {
            mediationFeeForReceipt = ext.getPlaintiffMediationFee().add(ext.getDefendantMediationFee());
        }
        // 自动生成收款单号（若为空，且总调解费>0）
        if (caseInfo.getReceiptNumber() == null && mediationFeeForReceipt != null && mediationFeeForReceipt.intValue() > 0) {
            String caseLocation = caseInfo.getCaseLocation();
            int currentYear = java.time.LocalDate.now().getYear();
            String yearPrefix = currentYear + "-";
            if ("本部".equals(caseLocation) || "四季青".equals(caseLocation)) {
                // 本部 + 四季青：按年份生成 yyyy-S0XX 序列
                String maxReceipt = caseInfoService.getMaxReceiptNumberForBenbuYear(yearPrefix);
                String nextReceipt;
                if (maxReceipt == null || !maxReceipt.startsWith(yearPrefix + "S0")) {
                    // 本年首次，从 S070 开始
                    nextReceipt = yearPrefix + "S001";
                } else {
                    // 形如 2026-S071
                    String body = maxReceipt.substring(yearPrefix.length()); // S071
                    String numPart = body.substring(1); // 071
                    int num;
                    try {
                        num = Integer.parseInt(numPart);
                    } catch (NumberFormatException e) {
                        num = 1;
                    }
                    nextReceipt = String.format("%sS%03d", yearPrefix, num + 1);
                }
                caseInfo.setReceiptNumber(nextReceipt);
            } else if ("凯旋街道".equals(caseLocation)) {
                // 凯旋街道：按年份生成 yyyy-KXX 序列
                String maxK = caseInfoService.getMaxReceiptNumberForKaixuanYear(yearPrefix);
                String nextK;
                if (maxK == null || !maxK.startsWith(yearPrefix + "K")) {
                    nextK = yearPrefix + "K001";
                } else {
                    // 形如 2026-K01
                    String body = maxK.substring(yearPrefix.length()); // K001
                    String numPart = body.substring(1); // 001
                    int num;
                    try {
                        num = Integer.parseInt(numPart);
                    } catch (NumberFormatException e) {
                        num = 1;
                    }
                    nextK = String.format("%sK%03d", yearPrefix, num + 1);
                }
                caseInfo.setReceiptNumber(nextK);
            } else if ("闸弄口".equals(caseLocation)) {
                // 闸弄口：按年份生成 yyyy-ZXX 序列
                String maxZ = caseInfoService.getMaxReceiptNumberForZhanongkouYear(yearPrefix);
                String nextZ;
                if (maxZ == null || !maxZ.startsWith(yearPrefix + "Z")) {
                    nextZ = yearPrefix + "Z001";
                } else {
                    // 形如 2026-Z01
                    String body = maxZ.substring(yearPrefix.length()); // Z001
                    String numPart = body.substring(1); // 001
                    int num;
                    try {
                        num = Integer.parseInt(numPart);
                    } catch (NumberFormatException e) {
                        num = 1;
                    }
                    nextZ = String.format("%sZ%03d", yearPrefix, num + 1);
                }
                caseInfo.setReceiptNumber(nextZ);
            } else {
                // 其他驻点：按年份生成 yyyy-XXX 的纯数字序列，从 070 起
                String maxReceipt = caseInfoService.getMaxReceiptNumberForOthersYear(yearPrefix);
                String nextReceipt;
                int baseStart = 001;
                if (maxReceipt == null || !maxReceipt.startsWith(yearPrefix)) {
                    nextReceipt = String.format("%s%03d", yearPrefix, baseStart);
                } else {
                    String seqPart = maxReceipt.substring(yearPrefix.length()); // 如 070
                    int seq;
                    try {
                        seq = Integer.parseInt(seqPart);
                    } catch (NumberFormatException e) {
                        seq = baseStart;
                    }
                    nextReceipt = String.format("%s%03d", yearPrefix, seq + 1);
                }
                caseInfo.setReceiptNumber(nextReceipt);
            }
        }
        ext.setPayer(payer);
        // 不再设置 ext.invoiced / ext.invoiceInfo，改由补充结案信息接口维护
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
                // 支持多选状态导出
                Object statusListObj = params.get("statusList");
                if (statusListObj instanceof java.util.List<?>) {
                    @SuppressWarnings("unchecked")
                    java.util.List<String> statusList = (java.util.List<String>) statusListObj;
                    request.setStatusList(statusList);
                }
                request.setStation((String) params.get("station"));
                request.setKeyword((String) params.getOrDefault("keyword", null));
                request.setPageNum(1);
                request.setPageSize(10000);
                Map<String, Object> pageResult = caseInfoService.getCasePage(request);
                exportList = (List<CaseInfo>) pageResult.get("records");
            }

            // 如果状态为“结案”，无论是否勾选案件，都导出结案专用格式
            String status = (String) params.get("status");
            if ("结案".equals(status)) {
                // 表头：序号、日期、案件、法院/引调、涉案金额、调解员、调解费、备注、驻点
                String[] headers = {"序号", "日期", "案件", "法院/引调", "涉案金额", "调解员", "调解费", "备注", "驻点"};
                Workbook workbook = new XSSFWorkbook();
                Sheet sheet = workbook.createSheet("结案案件导出");
                Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    headerRow.createCell(i).setCellValue(headers[i]);
                }

                int rowIdx = 1;
                double totalAdjustedAmount = 0d;
                double totalMediationFee = 0d;

                for (CaseInfo c : exportList) {
                    if (c == null) continue;
                    Row row = sheet.createRow(rowIdx);
                    int col = 0;
                    // 1. 序号
                    row.createCell(col++).setCellValue(rowIdx); // 从1开始
                    // 2. 日期 - 退回法院时间
                    row.createCell(col++).setCellValue(c.getReturnCourtTime() == null ? "" : c.getReturnCourtTime());
                    // 3. 案件 = 原告 被告 案由
                    String plaintiff = c.getPlaintiffName() == null ? "" : c.getPlaintiffName();
                    String defendant = c.getDefendantName() == null ? "" : c.getDefendantName();
                    String caseName = c.getCaseName() == null ? "" : c.getCaseName();
                    String caseDesc = (plaintiff + " " + defendant + " " + caseName).trim();
                    row.createCell(col++).setCellValue(caseDesc);
                    // 4. 法院/引调
                    String courtOrYD;
                    String caseNumber = c.getCaseNumber() == null ? "" : c.getCaseNumber();
                    if (caseNumber.startsWith("YT")) {
                        courtOrYD = "引调";
                    } else {
                        String location = c.getCaseLocation() == null ? "" : c.getCaseLocation();
                        if ("彭埠".equals(location) || "九堡".equals(location)) {
                            courtOrYD = "九堡";
                        } else {
                            courtOrYD = location;
                        }
                    }
                    row.createCell(col++).setCellValue(courtOrYD);
                    // 5. 涉案金额 - 调成标的额（caseCloseExt.adjustedAmount）
                    double adjustedAmount = 0d;
                    double mediationFee = 0d;
                    try {
                        String extJson = c.getCaseCloseExt();
                        if (extJson != null && !extJson.isEmpty()) {
                            CaseCloseExtDTO ext = objectMapper.readValue(extJson, CaseCloseExtDTO.class);
                            if (ext.getAdjustedAmount() != null) {
                                adjustedAmount = ext.getAdjustedAmount().doubleValue();
                            }
                            if (ext.getMediationFee() != null) {
                                mediationFee = ext.getMediationFee().doubleValue();
                            }
                        }
                    } catch (Exception e) {
                        // JSON 解析失败时跳过扩展字段，继续写入
                    }
                    row.createCell(col++).setCellValue(adjustedAmount);
                    // 6. 调解员 - 处理人
                    row.createCell(col++).setCellValue(c.getUsername() == null ? "" : c.getUsername());
                    // 7. 调解费 - caseCloseExt.mediationFee
                    row.createCell(col++).setCellValue(mediationFee);
                    // 8. 备注 - 结案备注（completion_notes）
                    row.createCell(col++).setCellValue(c.getCompletionRemark() == null ? "" : c.getCompletionRemark());
                    // 9. 驻点 - 驻点
                    row.createCell(col++).setCellValue(c.getCaseLocation() == null ? "" : c.getCaseLocation());

                    totalAdjustedAmount += adjustedAmount;
                    totalMediationFee += mediationFee;
                    rowIdx++;
                }

                // 合计行：只在涉案金额和调解费两列写入合计
                Row totalRow = sheet.createRow(rowIdx);
                totalRow.createCell(0).setCellValue("合计");
                // 涉案金额合计（第 5 列，索引4）
                totalRow.createCell(4).setCellValue(totalAdjustedAmount);
                // 调解费合计（第 7 列，索引6）
                totalRow.createCell(6).setCellValue(totalMediationFee);

                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                String filename = "结案案件导出_" + java.time.LocalDate.now() + ".xlsx";
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setHeader("Content-Disposition", "attachment; filename=" + java.net.URLEncoder.encode(filename, "UTF-8"));
                workbook.write(response.getOutputStream());
                response.flushBuffer();
                workbook.close();
                return;
            }

            // 非结案状态：保持原有导出列
            String[] headers = {
                "案件号", "案由", "标的额", "案件归属地", "原告", "被告", "法官", "案件助理", "领取时间", "退回法院时间",
                "状态", "处理人", "法院收案时间", "反馈情况", "退回情况", "案件完成情况", "调解失败备注", "关联案件包"
            };

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
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            String filename = "案件导出_" + java.time.LocalDate.now() + ".xlsx";
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

    /**
     * 上传结案付款截图（仅 jpg/png），返回可用于保存的 screenshotUrl。
     *
     * 说明：
     * - 新逻辑：写入 OSS，返回 objectName（例如 payment/xxx.png）
     * - 老逻辑：历史数据仍可能是 /uploads/payment/xxx（由 paymentFlows.screenshotUrlType 为空表示）
     */
    @PostMapping("/upload-payment-screenshot")
    public Result<String> uploadPaymentScreenshot(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.fail("文件不能为空");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            return Result.fail("文件名不能为空");
        }
        String lower = originalName.toLowerCase();
        if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png")) {
            return Result.fail("仅支持上传 jpg、jpeg 或 png 格式的图片");
        }

        try {
            String ext = lower.substring(lower.lastIndexOf('.'));
            String newName = java.util.UUID.randomUUID().toString().replace("-", "") + ext;
            String objectName = "payment/" + newName;

            // 上传到 OSS。这里 InputStream 由 MultipartFile 持有，上传完成后无需写磁盘。
            try (InputStream in = file.getInputStream()) {
                OssFileStorageAdapter.upload(in, objectName);
            }

            // 返回 objectName，前端在新增流水时配合 screenshotUrlType=Oss 走后端读取接口
            return Result.success(objectName);
        } catch (Exception e) {
            log.error("上传付款截图失败", e);
            return Result.fail("上传失败，请稍后重试");
        }
    }

    /**
     * 读取 OSS 中的付款截图内容。
     * 前端发现 paymentFlows[x].screenshotUrlType == "Oss" 时，使用该接口获取图片内容。
     */
    @GetMapping("/payment-screenshot")
    public void getPaymentScreenshot(@RequestParam("objectName") String objectName, HttpServletResponse response) throws IOException {
        if (objectName == null || objectName.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        // 简单安全校验：只允许 payment/ 前缀
        if (!objectName.startsWith("payment/")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        // 根据文件扩展名设置 content-type
        String contentType = URLConnection.guessContentTypeFromName(objectName);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        response.setContentType(contentType);

        try {
            OssFileStorageAdapter.download(objectName, response.getOutputStream());
        } catch (RuntimeException e) {
            log.error("读取付款截图失败: {}", objectName, e);
            response.reset();
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    /**
     * 新增付款流水
     * 支持新增、删除操作，返回操作结果。
     */
    @PostMapping("/payment-flows")
    public Result<?> updatePaymentFlows(@RequestBody Map<String, Object> params, HttpSession session) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        if (!"待结案".equals(caseInfo.getStatus())) {
            return Result.fail("仅待结案状态的案件可以补充付款流水");
        }
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }

        // 解析现有 ext
        CaseCloseExtDTO ext = null;
        try {
            if (caseInfo.getCaseCloseExt() != null && !caseInfo.getCaseCloseExt().isEmpty()) {
                ext = objectMapper.readValue(caseInfo.getCaseCloseExt(), CaseCloseExtDTO.class);
            }
        } catch (Exception e) {
            log.error("解析结案扩展信息失败", e);
        }
        if (ext == null) {
            ext = new CaseCloseExtDTO();
        }
        if (ext.getPaymentFlows() == null) {
            ext.setPaymentFlows(new java.util.ArrayList<>());
        }

        String action = (String) params.getOrDefault("action", "add");
        if ("add".equals(action)) {
            // 新增一条流水：screenshotUrl, payTime, amount
            String screenshotUrl = (String) params.get("screenshotUrl");
            String payTime = (String) params.get("payTime");
            Object amountObj = params.get("amount");
            if (screenshotUrl == null || screenshotUrl.isEmpty() || payTime == null || payTime.isEmpty() || amountObj == null) {
                return Result.fail("付款截图、付款时间和付款金额不能为空");
            }
            java.math.BigDecimal amount;
            try {
                amount = new java.math.BigDecimal(amountObj.toString());
            } catch (NumberFormatException e) {
                return Result.fail("付款金额格式错误");
            }
            if (amount.compareTo(java.math.BigDecimal.ZERO) < 0) {
                return Result.fail("付款金额不能为负");
            }

            CaseCloseExtDTO.PaymentFlow flow = new CaseCloseExtDTO.PaymentFlow();
            flow.setScreenshotUrl(screenshotUrl);
            // 新上传接口返回 oss objectName: payment/xxx.png
            if (screenshotUrl.startsWith("payment/")) {
                flow.setScreenshotUrlType("Oss");
            }
            flow.setPayTime(payTime);
            flow.setAmount(amount);
            ext.getPaymentFlows().add(flow);

        } else if ("remove".equals(action)) {
            // 按索引删除一条流水
            Object idxObj = params.get("index");
            if (idxObj == null) {
                return Result.fail("缺少要删除的流水索引");
            }
            int idx;
            try {
                idx = Integer.parseInt(idxObj.toString());
            } catch (NumberFormatException e) {
                return Result.fail("流水索引格式错误");
            }
            java.util.List<CaseCloseExtDTO.PaymentFlow> list = ext.getPaymentFlows();
            if (idx < 0 || idx >= list.size()) {
                return Result.fail("流水索引超出范围");
            }
            list.remove(idx);
        } else {
            return Result.fail("不支持的操作类型");
        }

        try {
            caseInfo.setCaseCloseExt(objectMapper.writeValueAsString(ext));
        } catch (Exception e) {
            log.error("序列化结案扩展信息失败", e);
            return Result.fail("保存付款流水失败");
        }
        caseInfo.setUpdatedTime(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        boolean ok = caseInfoService.updateById(caseInfo);
        return ok ? Result.success(ext.getPaymentFlows()) : Result.fail("保存付款流水失败");
    }
}
