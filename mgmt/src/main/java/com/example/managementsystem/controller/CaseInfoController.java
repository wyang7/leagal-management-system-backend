package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

    @PostMapping("/page")
    public Result<Map<String, Object>> getCasePage(@RequestBody Map<String, Object> params) {
        int pageNum = params.get("pageNum") != null ? (int) params.get("pageNum") : 1;
        int pageSize = params.get("pageSize") != null ? (int) params.get("pageSize") : 10;
        return Result.success(caseInfoService.getCasePage(pageNum, pageSize));
    }

    /**
     * 根据状态查询案件
     */
    @GetMapping("/status/{status}")
    public Result<List<CaseInfo>> getCasesByStatus(@PathVariable String status) {
        return Result.success(caseInfoService.getCasesByStatus(status));
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
        DateTimeFormatter noYearFormatter = DateTimeFormatter.ofPattern("M.d");
        DateTimeFormatter dbFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (CaseInfo caseInfo : caseList) {
            // 案件号自动生成
            caseInfo.setCaseNumber(caseInfoService.genCaseNumber());
            // 校验案件助理角色
            String caseLocation = caseInfo.getCaseLocation();
            User assistantByCaseLocation = userService.getAssistantByCaseLocation(caseLocation);
            if (assistantByCaseLocation != null) {
                caseInfo.setAssistantId(assistantByCaseLocation.getUserId());
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
                    caseInfo.setCourtReceiveTime(date.format(dbFormatter));
                } catch (DateTimeParseException e) {
                    return Result.fail("法院收案时间解析失败: " + courtReceiveTime);
                }
            }
            // 状态默认“待发布”
            caseInfo.setStatus("待发布");
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
        if (StringUtils.isEmpty(caseInfo.getCaseNumber())) {
            caseInfo.setCaseNumber(caseInfoService.genCaseNumber());
        }

        // 新增案件默认状态为"待发布"
        if (caseInfo.getStatus() == null || caseInfo.getStatus().isEmpty()) {
            caseInfo.setStatus("待发布");
        }
        boolean success = caseInfoService.save(caseInfo);
        return success ? Result.success() : Result.fail("新增案件失败");
    }

    /**
     * 更新案件
     */
    @PutMapping
    public Result<?> updateCase(@RequestBody CaseInfo caseInfo) {

        // 校验案件助理角色
        if (caseInfo.getAssistantId() != null) {
            boolean isAssistant = userService.checkUserRole(caseInfo.getAssistantId(), "案件助理");
            if (!isAssistant) {
                return Result.fail("所选用户不是案件助理角色");
            }
        }

        boolean success = caseInfoService.updateById(caseInfo);
        return success ? Result.success() : Result.fail("更新案件失败");
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
     * 领取案件
     */
    @PostMapping("/receive")
    public Result<?> receiveCase(@RequestBody Map<String, Object> params) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());
        
        boolean success = caseInfoService.receiveCase(caseId, userId);
        return success ? Result.success() : Result.fail("领取案件失败，可能案件状态不是待领取");
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
     * 完成案件（包含完成情况）
     */
    @PostMapping("/complete-with-notes")
    public Result<?> completeCaseWithNotes(@RequestBody Map<String, Object> params) {
        Long caseId = Long.parseLong(params.get("caseId").toString());
        String notes = params.get("notes").toString();

        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }

        // 更新状态和完成情况
        caseInfo.setStatus("已完成");
        caseInfo.setCompletionNotes(notes);
        boolean success = caseInfoService.updateById(caseInfo);
        return success ? Result.success() : Result.fail("更新案件失败");
    }
}
