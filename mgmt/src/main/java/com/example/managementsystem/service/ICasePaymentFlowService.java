package com.example.managementsystem.service;

import com.example.managementsystem.entity.CasePaymentFlow;
import java.util.List;

public interface ICasePaymentFlowService {
    void savePaymentFlows(Long caseId, List<CasePaymentFlow> flows);
    void savePaymentFlow(CasePaymentFlow flow);
    List<CasePaymentFlow> getByCaseId(Long caseId);
    void deleteByCaseId(Long caseId);
}

