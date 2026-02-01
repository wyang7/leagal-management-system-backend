package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 案件结案扩展信息（从 case_info.case_close_ext 拆分为独立表）
 */
@Data
@TableName("case_close_ext")
public class CaseCloseExt {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** case_info.case_id */
    @TableField("case_id")
    private Long caseId;

    /** 签字时间 (yyyy-MM-dd) */
    @TableField("sign_date")
    private String signDate;

    /** 调成标的额 */
    @TableField("adjusted_amount")
    private BigDecimal adjustedAmount;

    /** 调解费（总额） */
    @TableField("mediation_fee")
    private BigDecimal mediationFee;

    /** 原告调解费 */
    @TableField("plaintiff_mediation_fee")
    private BigDecimal plaintiffMediationFee;

    /** 被告调解费 */
    @TableField("defendant_mediation_fee")
    private BigDecimal defendantMediationFee;

    /** 支付方：原告/被告/原被告 */
    @TableField("payer")
    private String payer;

    /** 开票状态：暂未申请开票/待开票/已开票 */
    @TableField("invoice_status")
    private String invoiceStatus;

    /** 是否已付款 */
    @TableField("paid")
    private Boolean paid;

    /** 是否开票 */
    @TableField("invoiced")
    private Boolean invoiced;

    /** 开票信息 */
    @TableField("invoice_info")
    private String invoiceInfo;

    /** 付款流水(JSON) */
    @TableField("payment_flows")
    private String paymentFlows;

    /** 发票PDF(OSS objectName) */
    @TableField("invoice_pdf")
    private String invoicePdf;

    @TableField("created_time")
    private String createdTime;

    @TableField("updated_time")
    private String updatedTime;
}
