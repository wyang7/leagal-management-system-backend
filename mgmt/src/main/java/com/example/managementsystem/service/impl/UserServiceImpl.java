package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.entity.UserRole;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.mapper.RoleMapper;
import com.example.managementsystem.mapper.UserMapper;
import com.example.managementsystem.mapper.UserRoleMapper;
import com.example.managementsystem.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import javax.annotation.Resource;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
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

    @Resource
    private CaseInfoMapper caseInfoMapper;

    @Resource
    private UserRoleMapper userRoleMapper;

    @Override
    public List<User> getUsersByRoleId(Long roleId) {
        // 兼容新表：从 user_role 中查出 userId，再查用户
        List<UserRole> relations = userRoleMapper.selectByRoleIds(java.util.Collections.singletonList(roleId));
        if (CollectionUtils.isEmpty(relations)) {
            return new ArrayList<>();
        }
        List<Long> userIds = new ArrayList<>();
        for (UserRole ur : relations) {
            userIds.add(ur.getUserId());
        }
        List<User> users = this.listByIds(userIds);
        // 填充角色名称（多角色场景）
        fillUsersRoleNames(users);
        return users;
    }

    @Override
    public List<User> searchUsersByUsername(String username) {
        return baseMapper.selectByUsernameLike(username);
    }

    @Override
    public User searchUserByUsername(String username) {
        return baseMapper.selectByUsername(username);
    }

    @Override
    public boolean addUserWithRole(User user) {
        // 先保存用户本身
        user.setPassword(DigestUtils.md5DigestAsHex(
                user.getPassword().getBytes(StandardCharsets.UTF_8)
        ));
        user.setCreatedTime(new Date(System.currentTimeMillis()));
        user.setUpdatedTime(new Date(System.currentTimeMillis()));
        boolean saved = save(user);
        if (!saved) {
            return false;
        }
        // 兼容多角色：优先使用 user.roleIds，如果为空则回退到单个 roleId
        java.util.List<Long> roleIds = user.getRoleIds();
        if (roleIds != null && !roleIds.isEmpty()) {
            for (Long rid : roleIds) {
                if (rid == null) continue;
                UserRole ur = new UserRole();
                ur.setUserId(user.getUserId());
                ur.setRoleId(rid);
                userRoleMapper.insert(ur);
            }
        } else if (user.getRoleId() != null) {
            UserRole ur = new UserRole();
            ur.setUserId(user.getUserId());
            ur.setRoleId(user.getRoleId());
            userRoleMapper.insert(ur);
        }
        return true;
    }

    @Override
    public boolean updateUserWithRole(User user) {
        boolean updated = updateById(user);
        if (!updated) {
            return false;
        }
        // 清理旧关联
        userRoleMapper.deleteByUserId(user.getUserId());
        // 兼容多角色：优先使用 user.roleIds，如果为空则回退到单个 roleId
        java.util.List<Long> roleIds = user.getRoleIds();
        if (roleIds != null && !roleIds.isEmpty()) {
            for (Long rid : roleIds) {
                if (rid == null) continue;
                UserRole ur = new UserRole();
                ur.setUserId(user.getUserId());
                ur.setRoleId(rid);
                userRoleMapper.insert(ur);
            }
        } else if (user.getRoleId() != null) {
            UserRole ur = new UserRole();
            ur.setUserId(user.getUserId());
            ur.setRoleId(user.getRoleId());
            userRoleMapper.insert(ur);
        }
        return true;
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
        fillUsersRoleNames(list);
        return list;
    }

    private void fillUsersRoleNames(List<User> users) {
        if (CollectionUtils.isEmpty(users)) {
            return;
        }
        List<Long> userIds = new ArrayList<>();
        for (User u : users) {
            userIds.add(u.getUserId());
        }
        List<UserRole> relations = userRoleMapper.selectByUserIds(userIds);
        if (CollectionUtils.isEmpty(relations)) {
            return;
        }
        java.util.Map<Long, List<Long>> userRoleIdsMap = new java.util.HashMap<>();
        for (UserRole ur : relations) {
            userRoleIdsMap.computeIfAbsent(ur.getUserId(), k -> new ArrayList<>()).add(ur.getRoleId());
        }
        java.util.Set<Long> allRoleIds = new java.util.HashSet<>();
        userRoleIdsMap.values().forEach(allRoleIds::addAll);
        if (allRoleIds.isEmpty()) {
            return;
        }
        List<Role> roles = roleMapper.selectBatchIds(allRoleIds);
        java.util.Map<Long, Role> roleMap = new java.util.HashMap<>();
        for (Role r : roles) {
            roleMap.put(r.getRoleId(), r);
        }
        for (User u : users) {
            List<Long> rids = userRoleIdsMap.get(u.getUserId());
            if (CollectionUtils.isEmpty(rids)) {
                continue;
            }
            List<String> names = new ArrayList<>();
            for (Long rid : rids) {
                Role r = roleMap.get(rid);
                if (r != null) {
                    names.add(r.getRoleName());
                }
            }
            u.setRoleName(String.join(",", names));
        }
    }

    /**
     * 根据角色名称查询用户（新增实现）
     */
    @Override
    public List<User> getUsersByRoleName(String roleName) {
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
    public boolean checkUserRole(Long userId, List<String> roleTypes) {
        // 从 user_role 查用户所有角色，再判断是否存在任一匹配的 role_type
        List<UserRole> relations = userRoleMapper.selectByUserIds(java.util.Collections.singletonList(userId));
        if (CollectionUtils.isEmpty(relations)) {
            return false;
        }
        List<Long> roleIds = new ArrayList<>();
        for (UserRole ur : relations) {
            roleIds.add(ur.getRoleId());
        }
        if (roleIds.isEmpty()) {
            return false;
        }
        QueryWrapper<Role> roleQuery = new QueryWrapper<>();
        roleQuery.in("role_id", roleIds).in("role_type", roleTypes);
        List<Role> matched = roleMapper.selectList(roleQuery);
        return CollectionUtils.isNotEmpty(matched);
    }

    /**
     * 获取所有案件助理角色的用户
     * @return 案件助理用户列表
     */
    public List<User> getAssistants(String roleType){
        QueryWrapper<Role> roleQuery = new QueryWrapper<>();
        roleQuery.eq("role_type", roleType); // 假设角色表中角色类型字段为 role_type

        List<Role> roleList = roleMapper.selectList(roleQuery);
        if (CollectionUtils.isEmpty(roleList)) {
            return new ArrayList<>(); // 角色不存在，返回空列表
        }
        List<Long> roleIds = new ArrayList<>();
        for (Role r : roleList) {
            roleIds.add(r.getRoleId());
        }
        List<UserRole> relations = userRoleMapper.selectByRoleIds(roleIds);
        if (CollectionUtils.isEmpty(relations)) {
            return new ArrayList<>(); // 角色不存在，返回空列表
        }
        List<Long> userIds = new ArrayList<>();
        for (UserRole ur : relations) {
            userIds.add(ur.getUserId());
        }
        List<User> users = this.listByIds(userIds);
        fillUsersRoleNames(users);
        return users;
    }

    @Override
    public User getAssistantByCaseLocation(String caseLocation) {

        //根据caseLocation查询角色
        // 1. 根据角色类型查询角色ID
        QueryWrapper<Role> roleQuery = new QueryWrapper<>();
        roleQuery.eq("role_type", "案件助理"); // 假设角色表中角色类型字段为 role_type
        List<Role> roleList = roleMapper.selectList(roleQuery);
        if (CollectionUtils.isEmpty(roleList)) {
            return null; // 角色不存在，返回空列表
        }
        List<Role> matchRoles = new ArrayList<>();
        for (Role role : roleList) {
            if (role.getRoleName().contains(caseLocation)) {
                matchRoles.add(role);
            }
        }
        if (CollectionUtils.isEmpty(matchRoles)) {
            return null;
        }
        List<Long> roleIds = new ArrayList<>();
        for (Role r : matchRoles) {
            roleIds.add(r.getRoleId());
        }
        List<UserRole> relations = userRoleMapper.selectByRoleIds(roleIds);
        if (CollectionUtils.isEmpty(relations)) {
            return null;
        }
        List<Long> userIds = new ArrayList<>();
        for (UserRole ur : relations) {
            userIds.add(ur.getUserId());
        }
        List<User> assistants = this.listByIds(userIds);
        if (CollectionUtils.isEmpty(assistants)) {
            return null;
        }
        assistants.sort((a, b) -> a.getUserId().compareTo(b.getUserId()));
        QueryWrapper<CaseInfo> caseQuery = new QueryWrapper<>();
        caseQuery.orderByDesc("case_id").last("limit 1");
        CaseInfo lastCase = caseInfoMapper.selectOne(caseQuery);
        Long lastAssistantId = lastCase != null ? lastCase.getAssistantId() : null;
        int index = 0;
        if (lastAssistantId != null) {
            for (int i = 0; i < assistants.size(); i++) {
                if (assistants.get(i).getUserId().equals(lastAssistantId)) {
                    index = (i + 1) % assistants.size();
                    break;
                }
            }
        }
        return assistants.get(index);
    }


}
