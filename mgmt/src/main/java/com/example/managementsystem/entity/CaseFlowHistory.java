package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 案件流转历史记录表
 * </p>
 *
 * @author example
 * @since 2023-10-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class CaseFlowHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 案件ID
     */
    @TableField("case_id")
    private Long caseId;

    /**
     * 操作人ID
     */
    @TableField("operator_id")
    private Long operatorId;

    /**
     * 操作人姓名
     */
    @TableField("operator_name")
    private String operatorName;

    /**
     * 操作动作
     */
    @TableField("action")
    private String action;

    /**
     * 操作前状态
     */
    @TableField("before_status")
    private String beforeStatus;

    /**
     * 操作后状态
     */
    @TableField("after_status")
    private String afterStatus;

    /**
     * 操作备注
     */
    @TableField("remarks")
    private String remarks;

    /**
     * 操作时间
     */
    @TableField("create_time")
    private Date createTime;
}