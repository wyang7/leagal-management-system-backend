package com.example.managementsystem.mapper;

import com.example.managementsystem.entity.User;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * 用户表 Mapper 接口
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据角色ID查询用户
     */
    List<User> selectByRoleId(@Param("roleId") Long roleId);
    
    /**
     * 根据用户名模糊查询
     */
    List<User> selectByUsernameLike(@Param("username") String username);

    /**
     * 根据用户名精确查询
     */
    User selectByUsername(@Param("username") String username);

}
