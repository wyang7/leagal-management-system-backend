package com.example.managementsystem.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 开票管理列表展示 DTO（字段对齐案件管理，去掉法官，领取时间改为申请开票时间）。
 *
 * @author Copilot
 */
@Data
public class InvoiceCaseDTO {
    private Long caseId;
    private String caseNumber;
    private String caseName;
    private BigDecimal amount;
    private String caseLocation;
    private String plaintiffName;
    private String defendantName;
    private String assistantName;

    /** 申请开票时间（取 case_close_ext.updated_time） */
    private String applyInvoiceTime;

    /** 开票状态：待开票 / 已开票 */
    private String invoiceStatus;

    /** 处理人（case_info.username） */
    private String username;
}
