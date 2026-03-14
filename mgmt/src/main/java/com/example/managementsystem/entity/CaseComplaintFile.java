package com.example.managementsystem.entity;

import lombok.Data;
import java.util.Date;

/**
 * 案件诉状文件实体类
 * 用于存储案件相关的诉状图片文件，文件上传OSS前会进行加密处理
 */
@Data
public class CaseComplaintFile {
    private Long id;
    /** 关联案件ID */
    private Long caseId;
    /** 原始文件名 */
    private String originalFileName;
    /** OSS对象名称（加密存储） */
    private String ossObjectName;
    /** 文件大小（字节） */
    private Long fileSize;
    /** 文件类型（jpg/png/jpeg） */
    private String fileType;
    /** 备注 */
    private String remark;
    /** 上传人ID */
    private Long uploaderId;
    /** 上传人姓名 */
    private String uploaderName;
    /** 上传时间 */
    private Date uploadTime;
    /** 更新时间 */
    private Date updateTime;
}