package com.example.managementsystem.mapper;

import com.example.managementsystem.dto.InvoiceCaseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 开票管理查询 Mapper
 *
 * @author Copilot
 */
@Mapper
public interface InvoiceManagementMapper {

    int countInvoiceCases(@Param("invoiceStatus") String invoiceStatus,
                         @Param("keyword") String keyword);

    List<InvoiceCaseDTO> selectInvoiceCases(@Param("offset") int offset,
                                           @Param("pageSize") int pageSize,
                                           @Param("invoiceStatus") String invoiceStatus,
                                           @Param("keyword") String keyword);
}
