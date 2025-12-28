CREATE TABLE system_file (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_name    VARCHAR(255)   NOT NULL COMMENT '文件名',
    file_type    VARCHAR(64)    NOT NULL COMMENT '文件类型：委托材料、案件材料模板',
    secret_level VARCHAR(64)    NOT NULL COMMENT '保密等级',
    file_path    VARCHAR(512)   NOT NULL COMMENT '存储链接/相对路径',
    uploader     VARCHAR(128)   NOT NULL COMMENT '上传人用户名',
    upload_time  DATETIME       NOT NULL COMMENT '上传时间'
) COMMENT='案件系统文件表';

