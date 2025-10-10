package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.managementsystem.entity.CaseFlowHistory;
import com.example.managementsystem.mapper.CaseFlowHistoryMapper;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CaseFlowHistoryServiceImpl extends ServiceImpl<CaseFlowHistoryMapper, CaseFlowHistory> implements ICaseFlowHistoryService {

    @Override
    public void saveHistory(Long caseId, Long operatorId, String operatorName,
                            String action, String beforeStatus, String afterStatus, String remarks) {
        CaseFlowHistory history = new CaseFlowHistory();
        history.setCaseId(caseId);
        history.setOperatorId(operatorId);
        history.setOperatorName(operatorName);
        history.setAction(action);
        history.setBeforeStatus(beforeStatus);
        history.setAfterStatus(afterStatus);
        history.setRemarks(remarks);
        this.save(history);
    }

    @Override
    public List<CaseFlowHistory> getHistoryByCaseId(Long caseId) {
        return baseMapper.selectByCaseId(caseId);
    }
}