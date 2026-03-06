package com.example.managementsystem.service;

import com.example.managementsystem.dto.BankFlowPageRequest;
import com.example.managementsystem.entity.BankFlow;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IBankFlowService {

    Map<String, Object> page(BankFlowPageRequest request);

    BankFlow getById(Long id);

    BankFlow create(BankFlow flow);

    BankFlow update(BankFlow flow);

    boolean delete(Long id);

    /**
     * 批量导入（Excel），返回导入结果描述
     */
    Map<String, Object> importExcel(MultipartFile file);

    /**
     * 导出（按筛选条件），返回导出用的列表
     */
    List<BankFlow> listForExport(String keyword, String caseNumber);

    /**
     * 查询所有未绑定案件付款的银行流水（状态为"待案件匹配"）
     */
    List<BankFlow> listUnboundFlows();

    /**
     * 根据案件付款ID查询银行流水
     */
    BankFlow getByCasePaymentId(Long casePaymentId);

    /**
     * 提交案件流水申请（更新银行流水状态和案件付款ID）
     *
     * @param bankFlowId     银行流水ID
     * @param casePaymentId  案件付款ID
     * @param flowStatus     申请状态（申请结算/申请退费）
     * @return 更新后的银行流水
     */
    BankFlow submitCaseFlowApplication(Long bankFlowId, Long casePaymentId, String flowStatus);
}

