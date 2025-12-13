package com.example.managementsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.managementsystem.entity.UserRole;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户-角色关联表 Mapper
 */
public interface UserRoleMapper extends BaseMapper<UserRole> {

    List<UserRole> selectByUserIds(@Param("userIds") List<Long> userIds);

    List<UserRole> selectByRoleIds(@Param("roleIds") List<Long> roleIds);

    int deleteByUserId(@Param("userId") Long userId);
}

