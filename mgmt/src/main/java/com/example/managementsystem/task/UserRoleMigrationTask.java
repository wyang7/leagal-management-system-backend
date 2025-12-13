package com.example.managementsystem.task;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.entity.UserRole;
import com.example.managementsystem.mapper.UserRoleMapper;
import com.example.managementsystem.service.IUserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

/**
 * 启动时执行一次，将 user.role_id 迁移到 user_role 关联表
 */
//@Component // 需要迁移时取消注释
public class UserRoleMigrationTask implements CommandLineRunner {

    @Resource
    private IUserService userService;

    @Resource
    private UserRoleMapper userRoleMapper;

    @Override
    public void run(String... args) {
        List<User> users = userService.list();
        if (users == null || users.isEmpty()) {
            return;
        }
        for (User user : users) {
            if (user.getRoleId() == null) {
                continue;
            }
            QueryWrapper<UserRole> wrapper = new QueryWrapper<>();
            wrapper.eq("user_id", user.getUserId()).eq("role_id", user.getRoleId());
            Integer count = Math.toIntExact(userRoleMapper.selectCount(wrapper));
            if (count != null && count > 0) {
                continue;
            }
            UserRole ur = new UserRole();
            ur.setUserId(user.getUserId());
            ur.setRoleId(user.getRoleId());
            userRoleMapper.insert(ur);
        }
    }
}


