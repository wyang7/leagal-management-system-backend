package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.RoleMapper;
import com.example.managementsystem.service.IRoleService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.managementsystem.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * <p>
 * 角色表 服务实现类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Service
public class RoleServiceImpl extends ServiceImpl<RoleMapper, Role> implements IRoleService {

    @Autowired
    private IUserService userService;

    @Override
    public Role getRoleWithUsers(Long roleId) {
        Role role = getById(roleId);
        if (role != null) {
            List<User> users = userService.getUsersByRoleId(roleId);
            // 这里可以将用户信息设置到role对象中，或者返回一个包含用户的DTO
        }
        return role;
    }

    @Override
    public boolean assignUsersToRole(Long roleId, List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return false;
        }
        
        // 更新用户的角色ID
        for (Long userId : userIds) {
            User user = new User();
            user.setUserId(userId);
            user.setRoleId(roleId);
            userService.updateById(user);
        }
        return true;
    }

    // 实现：查询角色下的所有用户
    @Override
    public List<User> getUsersByRoleId(Long roleId) {
        return userService.getUsersByRoleId(roleId); // 复用用户服务的方法
    }

    // 实现：解除用户与角色的关联（将用户的roleId设为null）
    @Override
    public boolean unassignUserFromRole(Long roleId, Long userId) {
        // 1. 先查询用户是否存在，避免无效操作
        User user = userService.getById(userId);
        if (user == null) {
            return false;
        }

        // 2. 仅当用户当前角色ID与要解除的角色ID一致时才更新（避免误操作）
        if (user.getRoleId() == null || !user.getRoleId().equals(roleId)) {
            return false;
        }

        // 3. 创建更新对象，显式设置要更新的字段（roleId设为null）
        User updateUser = new User();
        updateUser.setUserId(userId);
        updateUser.setRoleId(null); // 关键：明确设置要更新的字段

        // 4. 使用updateById更新，MyBatis-Plus会自动生成正确的UPDATE语句
        return userService.updateById(updateUser);
    }
}
