package com.example.managementsystem.service.impl;

import com.example.managementsystem.dto.InvoiceCaseDTO;
import com.example.managementsystem.dto.InvoiceCasePageRequest;
import com.example.managementsystem.mapper.InvoiceManagementMapper;
import com.example.managementsystem.service.IInvoiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 开票管理服务实现
 *
 * @author Copilot
 */
@Service
public class InvoiceManagementServiceImpl implements IInvoiceManagementService {

    @Autowired
    private InvoiceManagementMapper invoiceManagementMapper;

    @Override
    public Map<String, Object> getInvoiceCasePage(InvoiceCasePageRequest request) {
        if (request == null) {
            return new HashMap<>();
        }
        int pageNum = request.getPageNum() == null || request.getPageNum() < 1 ? 1 : request.getPageNum();
        int pageSize = request.getPageSize() == null || request.getPageSize() < 1 ? 10 : Math.min(request.getPageSize(), 100);
        int offset = (pageNum - 1) * pageSize;

        String invoiceStatus = request.getInvoiceStatus();
        if (invoiceStatus == null || invoiceStatus.trim().isEmpty()) {
            invoiceStatus = "待开票";
        }
        if (!"待开票".equals(invoiceStatus) && !"已开票".equals(invoiceStatus)) {
            invoiceStatus = "待开票";
        }

        String keyword = request.getKeyword();

        int total = invoiceManagementMapper.countInvoiceCases(invoiceStatus, keyword);
        List<InvoiceCaseDTO> records = invoiceManagementMapper.selectInvoiceCases(offset, pageSize, invoiceStatus, keyword);

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("records", records);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }
}
