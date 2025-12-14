package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.entity.UserRole;
import com.example.managementsystem.service.IUserService;
import com.example.managementsystem.mapper.UserRoleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;

/**
 * <p>
 * 用户表 前端控制器
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private IUserService userService;

    @Resource
    private UserRoleMapper userRoleMapper;


    @GetMapping("/role/{roleName}")
    public Result<List<User>> getUsersByRole(@PathVariable String roleName) {
        return Result.success(userService.getUsersByRoleName(roleName));
    }

    @GetMapping("/assistants")
    public Result<List<User>> getCaseAssistants() {
        // 查询所有案件助理角色的用户
        List<User> assistants = userService.getAssistants("案件助理");
        return Result.success(assistants);
    }

    /**
     * 查询所有用户
     */
    @GetMapping
    public Result<List<User>> getAllUsers() {
        return Result.success(userService.list());
    }

    /**
     * 根据ID查询用户
     */
    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        // 查询该用户的所有角色ID列表，用于前端多角色回显
        java.util.List<UserRole> relations = userRoleMapper.selectByUserIds(java.util.Collections.singletonList(id));
        java.util.List<Long> roleIds = new java.util.ArrayList<>();
        if (relations != null) {
            for (UserRole ur : relations) {
                roleIds.add(ur.getRoleId());
            }
        }
        user.setRoleIds(roleIds);
        return Result.success(user);
    }

    /**
     * 根据用户名搜索用户
     */
    @GetMapping("/search")
    public Result<List<User>> searchUsers(@RequestParam String username) {
        return Result.success(userService.searchUsersByUsername(username));
    }

    /**
     * 新增用户
     */
    @PostMapping
    public Result<?> addUser(@RequestBody User user) {
        boolean success = userService.addUserWithRole(user);
        return success ? Result.success() : Result.fail("新增用户失败");
    }

    /**
     * 更新用户
     */
    @PutMapping
    public Result<?> updateUser(@RequestBody User user) {
        boolean success = userService.updateUserWithRole(user);
        return success ? Result.success() : Result.fail("更新用户失败");
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteUser(@PathVariable Long id) {
        boolean success = userService.removeById(id);
        return success ? Result.success() : Result.fail("删除用户失败");
    }
}
