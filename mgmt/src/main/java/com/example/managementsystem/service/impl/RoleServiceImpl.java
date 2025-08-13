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
}
