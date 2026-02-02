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

    @TableField("created_time")
    private String createdTime;

    @TableField("updated_time")
    private String updatedTime;
}

