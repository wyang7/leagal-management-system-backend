package com.example.managementsystem.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.managementsystem.entity.CaseFlowHistory;
import java.util.List;

public interface ICaseFlowHistoryService extends IService<CaseFlowHistory> {

    /**
     * 保存案件状态变更记录
     * @param caseId 案件ID
     * @param operatorId 操作人ID
     * @param operatorName 操作人姓名
     * @param action 操作动作
     * @param beforeStatus 操作前状态
     * @param afterStatus 操作后状态
     * @param remarks 备注
     */
    void saveHistory(Long caseId, Long operatorId, String operatorName,
                     String action, String beforeStatus, String afterStatus, String remarks);

    /**
     * 根据案件ID查询历史记录
     * @param caseId 案件ID
     * @return 历史记录列表
     */
    List<CaseFlowHistory> getHistoryByCaseId(Long caseId);
}
