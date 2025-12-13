-- 一次性迁移历史 user.role_id 数据到 user_role 关联表
INSERT INTO management_system.user_role (user_id, role_id, created_at)
SELECT u.user_id, u.role_id, NOW()
    FROM management_system.user u
      WHERE u.role_id IS NOT NULL
        AND NOT EXISTS (
              SELECT 1
              FROM management_system.user_role ur
              WHERE ur.user_id = u.user_id
                AND ur.role_id = u.role_id
          );