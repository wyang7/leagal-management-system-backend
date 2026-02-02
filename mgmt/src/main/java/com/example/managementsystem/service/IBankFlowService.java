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
}

