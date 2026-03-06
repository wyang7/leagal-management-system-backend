package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 银行流水
 */
@Data
@TableName("bank_flow")
public class BankFlow {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /** 流水号 */
    @TableField("flow_no")
    private String flowNo;

    /** 交易时间(建议 yyyy-MM-dd HH:mm:ss) */
    @TableField("trade_time")
    private String tradeTime;

    /** 交易金额 */
    @TableField("trade_amount")
    private BigDecimal tradeAmount;

    /** 付款方 */
    @TableField("payer")
    private String payer;

    /** 收款方 */
    @TableField("payee")
    private String payee;

    /** 交易渠道 */
    @TableField("channel")
    private String channel;

    /** 收款账号 */
    @TableField("payee_account")
    private String payeeAccount;

    /** 案件号（后续用于绑定案件） */
    @TableField("case_number")
    private String caseNumber;

    /** 流水状态：待案件匹配/申请结算/已结算/申请退费/已退费 */
    @TableField("flow_status")
    private String flowStatus;

    /** 案件付款ID（关联case_payment_flow表的ID） */
    @TableField("case_payment_id")
    private Long casePaymentId;

    @TableField("created_time")
    private String createdTime;

    @TableField("updated_time")
    private String updatedTime;
}

