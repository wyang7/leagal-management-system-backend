package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.CasePaymentFlow;
import com.example.managementsystem.mapper.CasePaymentFlowMapper;
import com.example.managementsystem.service.ICasePaymentFlowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CasePaymentFlowServiceImpl implements ICasePaymentFlowService {
    @Autowired
    private CasePaymentFlowMapper casePaymentFlowMapper;

    @Override
    @Transactional
    public void savePaymentFlows(Long caseId, List<CasePaymentFlow> flows) {
        if (caseId != null) {
            casePaymentFlowMapper.deleteByCaseId(caseId);
        }
        if (flows != null && !flows.isEmpty()) {
            casePaymentFlowMapper.insertBatch(flows);
        }
    }

    @Override
    public void savePaymentFlow(CasePaymentFlow flow) {
        casePaymentFlowMapper.insert(flow);
    }

    @Override
    public List<CasePaymentFlow> getByCaseId(Long caseId) {
        return casePaymentFlowMapper.selectByCaseId(caseId);
    }

    @Override
    public void deleteByCaseId(Long caseId) {
        casePaymentFlowMapper.deleteByCaseId(caseId);
    }
}

