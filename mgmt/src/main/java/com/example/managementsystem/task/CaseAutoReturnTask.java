package com.example.managementsystem.task;

import com.example.managementsystem.entity.CaseFlowHistory;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.service.ICaseInfoService;
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
            long daysSinceReceived = ChronoUnit.DAYS.between(caseInfo.getReceiveTime(), now);
            if (shouldAutoReturn(caseInfo, daysSinceReceived)) {
                String beforeStatus = caseInfo.getStatus();
                caseInfo.setStatus("退回");
                String reason = daysSinceReceived >= 15
                        ? "系统自动退回：领取案件超过15天未操作（当前状态：反馈）"
                        : "系统自动退回：领取案件超过3天未操作（当前状态：已领取）";
                caseInfo.setReturnReason(reason);
                caseInfoService.updateById(caseInfo);

                CaseFlowHistory history = new CaseFlowHistory();
                history.setCaseId(caseInfo.getCaseId());
                history.setAction("自动退回");
                history.setRemarks(reason);
                history.setCreateTime(new Date());
                history.setBeforeStatus(beforeStatus);
                history.setAfterStatus(caseInfo.getStatus());
                history.setOperatorName("System");
                history.setOperatorId(0L);
                caseFlowHistoryService.save(history);
            }
        }

        // 新增：检查所有【被分派】且状态为【已领取】或【反馈】的案件
        List<CaseInfo> assignedCases = caseInfoService.getAssignedCheckableCases();
        for (CaseInfo caseInfo : assignedCases) {
            long daysSinceReceived = ChronoUnit.DAYS.between(caseInfo.getReceiveTime(), now);

            if (daysSinceReceived > 10) {
                String beforeStatus = caseInfo.getStatus();
                caseInfo.setStatus("退回");
                String reason = "系统自动退回：被分派案件超过10天未操作（当前状态：" + beforeStatus + "）";
                caseInfo.setReturnReason(reason);
                caseInfoService.updateById(caseInfo);

                CaseFlowHistory history = new CaseFlowHistory();
                history.setCaseId(caseInfo.getCaseId());
                history.setAction("自动退回");
                history.setRemarks(reason);
                history.setCreateTime(new Date());
                history.setBeforeStatus(beforeStatus);
                history.setAfterStatus(caseInfo.getStatus());
                history.setOperatorName("System");
                history.setOperatorId(0L);
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