package com.example.managementsystem.service;

import com.example.managementsystem.entity.CaseFlowHistory;
import com.example.managementsystem.entity.CaseInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Component
public class CaseAutoReturnTask {

    @Autowired
    private ICaseInfoService caseInfoService;

    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;

    // 每天凌晨2点执行检查
    @Scheduled(cron = "0 0 2 * * ?")
    public void checkAndReturnCases() {
        LocalDateTime now = LocalDateTime.now();

        // 查询所有【自行领取】且状态为【已领取】或【反馈】的案件（需要检查的目标案件）
        List<CaseInfo> selfReceivedCases = caseInfoService.getSelfReceivedCheckableCases();

        for (CaseInfo caseInfo : selfReceivedCases) {
            // 计算领取至今的天数
            long daysSinceReceived = ChronoUnit.DAYS.between(caseInfo.getReceiveTime(), now);

            // 检查是否符合自动退回条件
            if (shouldAutoReturn(caseInfo, daysSinceReceived)) {
                // 执行自动退回
                String beforeStatus = caseInfo.getStatus();
                caseInfo.setStatus("退回");
                // 设置退回原因（区分两种规则）
                String reason = daysSinceReceived >= 15
                        ? "系统自动退回：超过15天未操作（当前状态：反馈）"
                        : "系统自动退回：超过3天未操作（当前状态：已领取）";
                caseInfo.setReturnReason(reason);
                caseInfoService.updateById(caseInfo);

                // 记录流程历史
                CaseFlowHistory history = new CaseFlowHistory();
                history.setCaseId(caseInfo.getCaseId());
                history.setAction("自动退回");
                history.setRemarks(reason);
                history.setCreateTime(new Date());
                history.setBeforeStatus(beforeStatus);
                history.setAfterStatus(caseInfo.getStatus());
                history.setOperatorName("System");
                caseFlowHistoryService.save(history);
            }
        }
    }

    /**
     * 判断是否需要自动退回（核心规则）
     * 规则1：领取时间≥3天，且状态为【已领取】→ 退回
     * 规则2：领取时间≥15天，且状态为【反馈】→ 退回
     */
    private boolean shouldAutoReturn(CaseInfo caseInfo, long daysSinceReceived) {
        String currentStatus = caseInfo.getStatus();
        // 规则1：3天内未从“已领取”转为“反馈”
        if (daysSinceReceived > 3 && "已领取".equals(currentStatus)) {
            return true;
        }
        // 规则2：15天内未从“反馈”转为其他状态（如“完成”“延期”等）
        if (daysSinceReceived > 15 && "反馈".equals(currentStatus)) {
            return true;
        }
        return false;
    }
}