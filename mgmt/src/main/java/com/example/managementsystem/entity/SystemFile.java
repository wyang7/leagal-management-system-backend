package com.example.managementsystem.entity;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * 案件系统文件表实体
 */
public class SystemFile implements Serializable {

    private Long id;

    /** 文件名（原始文件名） */
    private String fileName;

    /** 文件类型：委托材料、案件材料模板 */
    private String fileType;

    /** 保密等级 */
    private String secretLevel;

    /** 存储相对路径，例如 /uploads/system/xxx.doc */
    private String filePath;

    /** 上传人用户名 */
    private String uploader;

    /** 上传时间 */
    private Timestamp uploadTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getSecretLevel() {
        return secretLevel;
    }

    public void setSecretLevel(String secretLevel) {
        this.secretLevel = secretLevel;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getUploader() {
        return uploader;
    }

    public void setUploader(String uploader) {
        this.uploader = uploader;
    }

    public Timestamp getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(Timestamp uploadTime) {
        this.uploadTime = uploadTime;
    }
}

