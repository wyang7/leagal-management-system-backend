package com.example.managementsystem.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 角色表
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class Role implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 角色ID
     */
    @TableId(value = "role_id", type = IdType.AUTO)
    private Long roleId;

    /**
     * 角色名
     */
    private String roleName;

    /**
     * 角色类型（管理员、调解员）
     */
    @TableField("role_type")
    private String roleType;

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
