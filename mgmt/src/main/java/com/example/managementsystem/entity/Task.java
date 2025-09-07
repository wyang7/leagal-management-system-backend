package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 任务表
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 任务ID
     */
    @TableId(value = "task_id", type = IdType.AUTO)
    private Long taskId;

    /**
     * 任务名
     */
    private String taskName;

    /**
     * 任务状态
     */
    private String status;
    /**
     * 任务个数
     */
    @TableField(exist = false)
    private int caseCount;

    @TableField("owner_id")
    private Long ownerId;

    @TableField(exist = false)
    private String ownerName;

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
