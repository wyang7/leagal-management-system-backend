package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.UserMapper;
import com.example.managementsystem.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
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
}
