-- 案件诉状文件表
-- 用于存储案件相关的诉状图片文件，文件上传OSS前会进行加密处理
CREATE TABLE IF NOT EXISTS case_complaint_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    case_id BIGINT NOT NULL COMMENT '关联案件ID',
    original_file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    oss_object_name VARCHAR(500) NOT NULL COMMENT 'OSS对象名称（加密存储）',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_type VARCHAR(50) COMMENT '文件类型（jpg/png/jpeg）',
    remark VARCHAR(500) COMMENT '备注',
    uploader_id BIGINT COMMENT '上传人ID',
    uploader_name VARCHAR(100) COMMENT '上传人姓名',
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_case_id (case_id),
    INDEX idx_upload_time (upload_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件诉状文件表';
