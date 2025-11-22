package com.example.managementsystem.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 结案附加信息扩展字段，序列化为 JSON 存储在 case_info.case_close_ext
 */
@Data
public class CaseCloseExtDTO {
    /** 签字时间 (yyyy-MM-dd) */
    private String signDate;
    /** 调成标的额，默认原案件 amount */
    private BigDecimal adjustedAmount;
    /** 调解费 */
    private BigDecimal mediationFee;
    /** 支付方：原告/被告/原被告 */
    private String payer;
    /** 是否开票 */
    private Boolean invoiced;
    /** 开票信息（在 invoiced = true 时有效） */
    private String invoiceInfo;
}

