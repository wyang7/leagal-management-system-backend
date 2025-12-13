package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.io.Serializable;
import java.sql.Date;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 用户表
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    @TableId(value = "user_id", type = IdType.AUTO)
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码（加密存储）
     */
    private String password;

    /**
     * 账号状态（1-正常，0-禁用）
     */
    private Integer status;

    /**
     * 关联角色ID（已废弃，改用 user_role 关联表，多角色场景保留字段以兼容历史逻辑，不再作为唯一来源）
     */
    @TableField(value ="role_id" , updateStrategy = FieldStrategy.IGNORED)
    private Long roleId;

    /**
     * 角色名称（非数据库字段，用于前端展示；多角色时以逗号拼接）
     */
    @TableField(exist = false)
    private String roleName;

    // 添加自动填充注解，创建时自动生成时间
    @TableField(value = "created_time", fill = FieldFill.INSERT)
    private Date createdTime;  // 改为Date类型

    // 添加自动填充注解，创建和更新时自动生成时间
    @TableField(value = "updated_time", fill = FieldFill.INSERT_UPDATE)
    private Date updatedTime;  // 改为Date类型
}
