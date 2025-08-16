package com.example.managementsystem.service;

import com.example.managementsystem.entity.Role;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.managementsystem.entity.User;

import java.util.List;

/**
 * <p>
 * 角色表 服务类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface IRoleService extends IService<Role> {

    /**
     * 获取角色及关联的用户
     */
    Role getRoleWithUsers(Long roleId);
    
    /**
     * 为角色分配用户
     */
    boolean assignUsersToRole(Long roleId, List<Long> userIds);

    // 添加：查询角色下的所有用户
    List<User> getUsersByRoleId(Long roleId);

    // 添加：解除用户与角色的关联
    boolean unassignUserFromRole(Long roleId, Long userId);
}
