package com.example.managementsystem.service.impl;

import com.example.managementsystem.adapter.OssFileStorageAdapter;
import com.example.managementsystem.entity.CaseComplaintFile;
import com.example.managementsystem.mapper.CaseComplaintFileMapper;
import com.example.managementsystem.service.ICaseComplaintFileService;
import com.example.managementsystem.util.FileCryptoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 案件诉状文件服务实现类
 */
@Service
public class CaseComplaintFileServiceImpl implements ICaseComplaintFileService {

    /**
     * OSS存储路径前缀 - 诉状文件独立文件夹
     */
    private static final String OSS_PREFIX = "complaint/";

    /**
     * 允许上传的文件类型
     */
    private static final List<String> ALLOWED_FILE_TYPES = Arrays.asList("jpg", "jpeg", "png");

    /**
     * 最大文件大小 10MB
     */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Autowired
    private CaseComplaintFileMapper caseComplaintFileMapper;

    @Override
    public CaseComplaintFile uploadFile(Long caseId, MultipartFile file, String remark, Long userId, String userName) throws IOException {
        // 参数校验
        if (caseId == null) {
            throw new IllegalArgumentException("案件ID不能为空");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }

        // 文件大小校验
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过10MB");
        }

        // 获取文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("文件名格式不正确");
        }

        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_FILE_TYPES.contains(fileExtension)) {
            throw new IllegalArgumentException("仅支持上传 jpg、jpeg、png 格式的图片文件");
        }

        // 读取文件字节并加密
        byte[] fileBytes = file.getBytes();
        byte[] encryptedBytes = FileCryptoUtil.encrypt(fileBytes);

        // 生成OSS对象名称
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String ossObjectName = OSS_PREFIX + caseId + "/" + uuid + "." + fileExtension;

        // 上传到OSS
        ByteArrayInputStream inputStream = new ByteArrayInputStream(encryptedBytes);
        OssFileStorageAdapter.upload(inputStream, ossObjectName);

        // 保存数据库记录
        CaseComplaintFile complaintFile = new CaseComplaintFile();
        complaintFile.setCaseId(caseId);
        complaintFile.setOriginalFileName(originalFilename);
        complaintFile.setOssObjectName(ossObjectName);
        complaintFile.setFileSize(file.getSize());
        complaintFile.setFileType(fileExtension);
        complaintFile.setRemark(remark);
        complaintFile.setUploaderId(userId);
        complaintFile.setUploaderName(userName);

        caseComplaintFileMapper.insert(complaintFile);

        return complaintFile;
    }

    @Override
    public List<CaseComplaintFile> getFilesByCaseId(Long caseId) {
        if (caseId == null) {
            return new ArrayList<>();
        }
        return caseComplaintFileMapper.selectByCaseId(caseId);
    }

    @Override
    public CaseComplaintFile getFileById(Long id) {
        if (id == null) {
            return null;
        }
        return caseComplaintFileMapper.selectById(id);
    }

    @Override
    public boolean deleteFile(Long id) {
        if (id == null) {
            return false;
        }

        // 查询文件记录
        CaseComplaintFile file = caseComplaintFileMapper.selectById(id);
        if (file == null) {
            return false;
        }

        // TODO: 如果需要从OSS删除文件，可以在这里调用OSS删除接口
        // 目前保留OSS文件，只删除数据库记录

        return caseComplaintFileMapper.deleteById(id) > 0;
    }

    @Override
    public boolean updateRemark(Long id, String remark) {
        if (id == null) {
            return false;
        }
        return caseComplaintFileMapper.updateRemark(id, remark) > 0;
    }

    @Override
    public void downloadFile(Long id, HttpServletResponse response) throws IOException {
        CaseComplaintFile file = caseComplaintFileMapper.selectById(id);
        if (file == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "文件不存在");
            return;
        }

        // 从OSS读取加密文件
        byte[] encryptedBytes = OssFileStorageAdapter.readAsBytes(file.getOssObjectName());

        // 解密文件
        byte[] decryptedBytes = FileCryptoUtil.decrypt(encryptedBytes);

        // 设置响应头
        String contentType = getContentType(file.getFileType());
        response.setContentType(contentType);
        response.setContentLength(decryptedBytes.length);
        response.setHeader("Content-Disposition", "inline; filename=\"" + file.getOriginalFileName() + "\"");

        // 写入响应流
        try (OutputStream out = response.getOutputStream()) {
            out.write(decryptedBytes);
            out.flush();
        }
    }

    @Override
    public byte[] getFileBytes(Long id) throws IOException {
        CaseComplaintFile file = caseComplaintFileMapper.selectById(id);
        if (file == null) {
            return null;
        }

        // 从OSS读取加密文件
        byte[] encryptedBytes = OssFileStorageAdapter.readAsBytes(file.getOssObjectName());

        // 解密并返回
        return FileCryptoUtil.decrypt(encryptedBytes);
    }

    /**
     * 根据文件类型获取ContentType
     */
    private String getContentType(String fileType) {
        String type = fileType != null ? fileType.toLowerCase() : "";
        if ("jpg".equals(type) || "jpeg".equals(type)) {
            return "image/jpeg";
        } else if ("png".equals(type)) {
            return "image/png";
        } else {
            return "application/octet-stream";
        }
    }
}
