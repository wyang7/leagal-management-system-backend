package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.math.BigDecimal;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 案件表
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class CaseInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 案件ID
     */
    @TableId(value = "case_id", type = IdType.AUTO)
    private Long caseId;

    /**
     * 案件号
     */
    @TableField("case_number")
    private String caseNumber;

    /**
     * 案由
     */
    @TableField("case_name")
    private String caseName;

    /**
     * 新增：标的额（精确到小数点后两位）
     */
    @TableField("amount")
    private BigDecimal amount;

    /**
     * 绑定的任务ID
     */
    @TableField("task_id")
    private Long taskId;
    
    /**
     * 任务名称（非数据库字段，用于前端展示）
     */
    @TableField(exist = false)
    private String taskName;

    /**
     * 案件状态：待领取->已领取->已完成
     */
    private String status;

    /**
     * 案件绑定用户ID
     */
    @TableField("user_id")
    private Long userId;

    @TableField("completion_notes")
    private String completionNotes;

    /**
     * 案件归属地
     */
    @TableField("case_location")
    private String caseLocation;

    /**
     * 法院收案时间
     */
    @TableField("court_receive_time")
    private String courtReceiveTime;

    /**
     * 原告
     */
    @TableField("plaintiff_name")
    private String plaintiffName;

    /**
     * 被告
     */
    @TableField("defendant_name")
    private String defendantName;

    /**
     * 案件助理ID
     */
    @TableField("assistant_id")
    private Long assistantId;

    /**
     * 案件助理姓名（非数据库字段）
     */
    @TableField(exist = false)
    private String assistantName;
    
    /**
     * 用户名（非数据库字段，用于前端展示）
     */
    @TableField(exist = false)
    private String username;

    /**
     * 创建时间
     */
    @TableField("created_time")
    private String createdTime;

    /**
     * 更新时间
     */
    @TableField("updated_time")
    private String updatedTime;
}
