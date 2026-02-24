package com.example.managementsystem.dto;

import com.example.managementsystem.entity.CaseCloseExt;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import java.math.BigDecimal;

/**
 * 结案附加信息扩展字段，序列化为 JSON 存储在 case_info.case_close_ext
 *
 * @author Copilot
 */
@Data
public class CaseCloseExtDTO {
    /**
     * 结案方式（原一直存储在 case_info.completion_notes/接口参数 notes）。
     * 取值：司法确认/撤诉/民初/其他
     */
    private String completionNotes;

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

    /**
     * 开票状态：
     * 1、暂未申请开票
     * 2、待开票
     * 3、已开票
     */
    private String invoiceStatus;

    /**
     * 是否已付款（申请开票弹窗维护）。
     */
    private Boolean paid;

    /**
     * @deprecated 历史字段：是否开票。新流程请使用 invoiceStatus。
     */
    @Deprecated
    private Boolean invoiced;

    /** 开票信息（在 invoiced = true 时有效） */
    private String invoiceInfo;
    /** 付款流水列表 */
    private java.util.List<PaymentFlow> paymentFlows;

    /**
     * 发票PDF（OSS objectName，例如 invoice/xxx.pdf）。
     * 与付款流水同级展示，供财务在“开票审核”中上传后写入。
     */
    private String invoicePdf;

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

        /** 付款渠道：青枫 / 澎和助力 / 澎和信息 */
        private String channel;

        /** 付款时间 (yyyy-MM-dd HH:mm:ss) */
        private String payTime;
        /** 付款金额 */
        private BigDecimal amount;
    }

    /**
     * 从拆分表实体转换为 DTO（用于读切换：从 case_close_ext 表组装回前端仍使用的 JSON 字段）。
     *
     * <p>注意：
     * - paymentFlows 在拆表中以 JSON 字符串存储，转换时会尝试解析为 List。
     * - 解析失败时不会抛异常，paymentFlows 将保持为 null（避免影响主流程）。
     */
    public static CaseCloseExtDTO fromEntity(CaseCloseExt entity) {
        if (entity == null) {
            return null;
        }
        CaseCloseExtDTO dto = new CaseCloseExtDTO();
        dto.setCompletionNotes(entity.getCompletionNotes());
        dto.setSignDate(entity.getSignDate());
        dto.setAdjustedAmount(entity.getAdjustedAmount());
        dto.setMediationFee(entity.getMediationFee());
        dto.setPlaintiffMediationFee(entity.getPlaintiffMediationFee());
        dto.setDefendantMediationFee(entity.getDefendantMediationFee());
        dto.setPayer(entity.getPayer());

        dto.setInvoiceStatus(entity.getInvoiceStatus());
        dto.setPaid(entity.getPaid());
        dto.setInvoiced(entity.getInvoiced());
        dto.setInvoiceInfo(entity.getInvoiceInfo());
        dto.setInvoicePdf(entity.getInvoicePdf());

        String flowsJson = entity.getPaymentFlows();
        if (flowsJson != null && !flowsJson.trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                java.util.List<PaymentFlow> flows = mapper.readValue(
                        flowsJson,
                        mapper.getTypeFactory().constructCollectionType(java.util.List.class, PaymentFlow.class)
                );
                dto.setPaymentFlows(flows);
            } catch (Exception ignored) {
                // 兼容：拆表 payment_flows 历史数据可能不规范，解析失败不影响返回
            }
        }
        return dto;
    }
}
