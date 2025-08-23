package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.RoleMapper;
import com.example.managementsystem.mapper.UserMapper;
import com.example.managementsystem.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 用户表 服务实现类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    @Resource
    private RoleMapper roleMapper;

    @Override
    public List<User> getUsersByRoleId(Long roleId) {
        return baseMapper.selectByRoleId(roleId);
    }

    @Override
    public List<User> searchUsersByUsername(String username) {
        return baseMapper.selectByUsernameLike(username);
    }

    @Override
    public boolean addUserWithRole(User user) {
        // 直接保存用户，角色ID已在user对象中
        return save(user);
    }

    @Override
    public boolean updateUserWithRole(User user) {
        // 直接更新用户，角色ID已在user对象中
        return updateById(user);
    }


    @Override
    public User getUserByUsernameAndPassword(String username, String password) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username)
                .eq("password", password);
        return baseMapper.selectOne(queryWrapper);
    }

    @Override
    public boolean existsByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        return baseMapper.exists(queryWrapper);
    }

    @Override
    public List<User> list() {
        List<User> list = this.list(Wrappers.emptyWrapper());
        if (list != null && !list.isEmpty()) {
            for (User user : list) {
                if (user.getRoleId() != null) {
                    Role role = roleMapper.selectById(user.getRoleId());
                    if (role != null) {
                        user.setRoleName(role.getRoleName());
                    }
                }
            }
        }
        return list;
    }

    /**
     * 根据角色名称查询用户（新增实现）
     */
    @Override
    public List<User> getUsersByRoleName(String roleName) {
        // 1. 根据角色名称查询角色ID
        QueryWrapper<Role> roleQuery = new QueryWrapper<>();
        roleQuery.eq("role_name", roleName); // 假设角色表中角色名称字段为 role_name

        Role role = roleMapper.selectOne(roleQuery);
        if (role == null) {
            return new ArrayList<>(); // 角色不存在，返回空列表
        }

        // 2. 根据角色ID查询用户（复用已有的 getUsersByRoleId 方法）
        return getUsersByRoleId(role.getRoleId());
    }

    /**
     * 校验用户是否属于指定角色（新增实现）
     */
    @Override
    public boolean checkUserRole(Long userId, String roleName) {
        // 1. 查询用户信息，获取其角色ID
        User user = getById(userId);
        if (user == null || user.getRoleId() == null) {
            return false; // 用户不存在或未分配角色
        }

        // 2. 查询指定角色名称对应的角色ID
        QueryWrapper<Role> roleQuery = new QueryWrapper<>();
        roleQuery.eq("role_name", roleName);
        Role role = roleMapper.selectOne(roleQuery);
        if (role == null) {
            return false; // 角色不存在
        }

        // 3. 校验用户的角色ID是否与目标角色ID一致
        return user.getRoleId().equals(role.getRoleId());
    }
}
