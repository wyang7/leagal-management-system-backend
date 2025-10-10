package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
public class CaseInfoController {

    @Autowired
    private ICaseInfoService caseInfoService;

    @Autowired
    private IUserService userService;

    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;

    /**
     * 根据状态筛选案件（支持多个状态）
     */
    @GetMapping("/filter-by-status")
    public Result<List<CaseInfo>> filterCasesByStatus(
            @RequestParam List<String> statusList,
            @RequestParam Integer taskId,
            @RequestParam(required = false) String caseName) {
        return Result.success(caseInfoService.getCasesByStatusList(statusList,taskId,caseName));
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
     * 分页查询案件列表
     * 支持前端请求格式: /case/page?pageNum=1&pageSize=10&t=1755945819649
     */
    @GetMapping("/page")
    public Result<Map<String, Object>> getCasePage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String caseName,
            @RequestParam(required = false) String status,          // 原有：状态
            @RequestParam(required = false) String caseNumber,      // 新增：案号
            @RequestParam(required = false) String plaintiff,       // 新增：原告
            @RequestParam(required = false) String defendant) {

        // 校验分页参数合法性
        if (pageNum < 1) {
            pageNum = 1;
        }
        if (pageSize < 1 || pageSize > 100) {
            pageSize = 10; // 限制最大每页100条
        }

        // 调用服务层获取分页数据
        Map<String, Object> pageResult = caseInfoService.getCasePage(caseName,status, caseNumber, plaintiff, defendant
                ,pageNum, pageSize);

        // 返回统一格式的响应
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

        for (CaseInfo caseInfo : caseList) {
            // 校验案件助理角色
            if (StringUtils.isEmpty(caseInfo.getAssistantName())) {
                String caseLocation = caseInfo.getCaseLocation();
                User assistantByCaseLocation = userService.getAssistantByCaseLocation(caseLocation);
                if (assistantByCaseLocation != null) {
                    caseInfo.setAssistantId(assistantByCaseLocation.getUserId());
                }
            }else {
                User userByName = userService.searchUserByUsername(caseInfo.getAssistantName());
                if (userByName == null) {
                    return Result.fail("案件助理不存在: " + caseInfo.getAssistantName());
                }
                boolean isAssistant = userService.checkUserRole(userByName.getUserId(), "案件助理");
                if (!isAssistant) {
                    return Result.fail("所选用户不是案件助理角色: " + caseInfo.getAssistantName());
                }
                caseInfo.setAssistantId(userByName.getUserId());
            }

            // 处理法院收案时间
            String courtReceiveTime = caseInfo.getCourtReceiveTime();
            LocalDate date;
            if (courtReceiveTime != null) {
                try {
                    if (courtReceiveTime.matches("^\\d{4}\\.\\d{1,2}\\.\\d{1,2}$")) {
                        date = LocalDate.parse(courtReceiveTime, fullFormatter);
                    } else if (courtReceiveTime.matches("^\\d{1,2}\\.\\d{1,2}$")) {
                        int year = LocalDate.now().getYear();
                        date = LocalDate.parse(year + "." + courtReceiveTime, fullFormatter);
                    } else {
                        return Result.fail("法院收案时间格式错误: " + courtReceiveTime);
                    }
                    // 案件号自动生成，必须要放在这里，因为生成案号需要用到法院收案时间
                    caseInfo.setCaseNumber(caseInfoService.genCaseNumber(caseInfo.getCourtReceiveTime()));
                    caseInfo.setCourtReceiveTime(date.format(dbFormatter));
                } catch (DateTimeParseException e) {
                    return Result.fail("法院收案时间解析失败: " + courtReceiveTime);
                }
            }else {
                return Result.fail("法院收案时间不能为空");
            }
            // 状态默认“待领取”
            caseInfo.setStatus("待领取");
            // 创建时间
            caseInfo.setCreatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            caseInfoService.save(caseInfo);
        }
        return Result.success();
    }

    /**
     * 新增案件
     */
    @PostMapping
    public Result<?> addCase(@RequestBody CaseInfo caseInfo) {

        // 校验案件助理角色
        if (caseInfo.getAssistantId() != null) {
            boolean isAssistant = userService.checkUserRole(caseInfo.getAssistantId(), "案件助理");
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
        CaseInfo caseInfo = caseInfoService.getById(id);
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
        Long mediatorReceiveTime = caseById.getMediatorReceiveTime();
        if (mediatorReceiveTime != null && System.currentTimeMillis()-mediatorReceiveTime < 24*60*60*1000) {
            return Result.fail("案件不允许在领取后24小时之内退回");
        }
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
     * 案件预反馈接口
     * 接收案件ID和预反馈内容，更新状态为预反馈
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

        // 校验状态是否为已领取（只能从已领取状态流转到预反馈）
        if (!"已领取".equals(caseInfo.getStatus())) {
            return Result.fail("只有已领取的案件可以提交预反馈");
        }
        String beforeStatus = caseInfo.getStatus();
        // 更新案件信息
        caseInfo.setStatus("预反馈"); // 变更状态为预反馈
        caseInfo.setPreFeedback(preFeedback); // 存储预反馈内容
        caseInfo.setUpdatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))); // 更新时间

        boolean success = caseInfoService.updateById(caseInfo);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "案件预反馈",
                    beforeStatus,
                    "预反馈",
                    preFeedback
            );
            return Result.success();
        } else {
            return Result.fail("预反馈提交失败");
        }
    }

    /**
     * 案件延期接口
     * 接收案件ID和延期原因，从已领取或预反馈状态流转到延期状态
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

        // 校验状态是否为已领取或预反馈（只能从这两个状态流转到延期）
        String currentStatus = caseInfo.getStatus();
        if (!"已领取".equals(currentStatus) && !"预反馈".equals(currentStatus)) {
            return Result.fail("只有已领取或预反馈的案件可以申请延期");
        }
        String beforeStatus = caseInfo.getStatus();
        // 更新案件信息
        caseInfo.setStatus("延期"); // 变更状态为延期
        caseInfo.setDelayReason(delayReason); // 存储延期原因
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
    public Result<?> updateCaseStatus(@RequestBody Map<String, Object> params) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String status = params.get("status").toString();
        
        boolean success = caseInfoService.updateCaseStatus(caseId, status);
        return success ? Result.success() : Result.fail("更新案件状态失败");
    }

    /**
     * 获取当前用户的案件
     */
    @GetMapping("/my-cases")
    public Result<List<CaseInfo>> getMyCases(@RequestParam Long userId) {
        return Result.success(caseInfoService.getMyCases(userId));
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


        // 更新状态和完成情况
        caseInfo.setStatus("已完成");
        caseInfo.setCompletionNotes(notes);
        boolean success = caseInfoService.updateById(caseInfo);
        if (success) {
            // 保存历史记录
            caseFlowHistoryService.saveHistory(
                    caseId,
                    operatorId,
                    operatorName,
                    "完成案件",
                    caseInfo.getStatus(),
                    "已完成",
                    notes
            );
            return Result.success();
        } else {
            return Result.fail("完成案件失败");
        }
    }
}
