package com.example.managementsystem.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class CasePaymentFlow {
    private Long id;
    private Long caseId;
    private String screenshotUrl;
    private String screenshotUrlType;
    private String channel;
    private Date payTime;
    private BigDecimal amount;
    private Date createdTime;
    private Date updatedTime;

    /** 绑定的银行流水ID（非表字段，仅用于前端展示） */
    private Long bankFlowId;

    /** 绑定的银行流水号（flow_no，对应bank_flow.flow_no，非表字段） */
    private String bankFlowNo;

    /** 绑定银行流水的当前状态（flow_status：申请结算/已结算/申请退费/已退费等，非表字段） */
    private String bankFlowStatus;
}
