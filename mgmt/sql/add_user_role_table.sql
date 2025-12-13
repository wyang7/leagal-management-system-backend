
CREATE TABLE IF NOT EXISTS management_system.user_role (
                                                           id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
                                                           user_id    BIGINT                         NOT NULL COMMENT '用户ID',
                                                           role_id    BIGINT                         NOT NULL COMMENT '角色ID',
                                                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL COMMENT '创建时间',
                                                           CONSTRAINT uk_user_role UNIQUE (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id)
    REFERENCES management_system.user (user_id)
    ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id)
    REFERENCES management_system.role (role_id)
    ON DELETE CASCADE
    ) COMMENT '用户-角色关联表' CHARSET = utf8mb4;
