package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.CasePaymentFlow;
import com.example.managementsystem.entity.BankFlow;
import com.example.managementsystem.mapper.CasePaymentFlowMapper;
import com.example.managementsystem.service.ICasePaymentFlowService;
import com.example.managementsystem.service.IBankFlowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CasePaymentFlowServiceImpl implements ICasePaymentFlowService {
    @Autowired
    private CasePaymentFlowMapper casePaymentFlowMapper;

    @Autowired
    private IBankFlowService bankFlowService;

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
        List<CasePaymentFlow> flows = casePaymentFlowMapper.selectByCaseId(caseId);
        // 为每条付款流水补充绑定的银行流水信息（若存在）
        if (flows != null && !flows.isEmpty()) {
            for (CasePaymentFlow flow : flows) {
                if (flow.getId() == null) continue;
                try {
                    BankFlow bf = bankFlowService.getByCasePaymentId(flow.getId());
                    if (bf != null && bf.getCasePaymentId() != null) {
                        flow.setBankFlowId(bf.getId());
                        flow.setBankFlowNo(bf.getFlowNo());
                        flow.setBankFlowStatus(bf.getFlowStatus());
                    }
                } catch (Exception ignored) {
                    // 单条异常不影响整体
                }
            }
        }
        return flows;
    }

    @Override
    public void deleteByCaseId(Long caseId) {
        casePaymentFlowMapper.deleteByCaseId(caseId);
    }

    @Override
    @Transactional
    public void deleteByCaseIdAndIndex(Long caseId, int index) {
        List<CasePaymentFlow> flows = casePaymentFlowMapper.selectByCaseId(caseId);
        if (flows != null && index >= 0 && index < flows.size()) {
            Long id = flows.get(index).getId();
            if (id != null) {
                casePaymentFlowMapper.deleteById(id);
            }
        }
    }
}
