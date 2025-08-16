package com.example.managementsystem.service;

import com.example.managementsystem.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;
import java.util.List;

/**
 * <p>
 * 用户表 服务类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface IUserService extends IService<User> {

    /**
     * 根据角色ID查询用户
     */
    List<User> getUsersByRoleId(Long roleId);
    
    /**
     * 根据用户名模糊查询
     */
    List<User> searchUsersByUsername(String username);
    
    /**
     * 新增用户并关联角色
     */
    boolean addUserWithRole(User user);
    
    /**
     * 更新用户及关联角色
     */
    boolean updateUserWithRole(User user);

    /**
     * 根据用户名和密码查询用户
     */
    User getUserByUsernameAndPassword(String username, String password);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);
}
