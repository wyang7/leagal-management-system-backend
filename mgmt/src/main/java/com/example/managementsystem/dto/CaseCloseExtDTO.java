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
    /** 调解费（总额） */
    private BigDecimal mediationFee;
    /** 原告调解费（当支付方为原被告时使用） */
    private BigDecimal plaintiffMediationFee;
    /** 被告调解费（当支付方为原被告时使用） */
    private BigDecimal defendantMediationFee;
    /** 支付方：原告/被告/原被告 */
    private String payer;
    /** 是否开票 */
    private Boolean invoiced;
    /** 开票信息（在 invoiced = true 时有效） */
    private String invoiceInfo;
    /** 付款流水列表 */
    private java.util.List<PaymentFlow> paymentFlows;

    @Data
    public static class PaymentFlow {
        /** 付款截图URL（历史数据通常是 /uploads/payment/xxx，新数据可存 OSS objectName，例如 payment/xxx.png） */
        private String screenshotUrl;

        /**
         * 截图地址类型：
         * - Oss：表示 screenshotUrl 存的是 OSS 的 objectName，需要走后端下载接口取内容
         * - 空/其它：表示仍然是旧的本地资源路径，前端可直接访问
         */
        private String screenshotUrlType;

        /** 付款时间 (yyyy-MM-dd HH:mm:ss) */
        private String payTime;
        /** 付款金额 */
        private BigDecimal amount;
    }
}
