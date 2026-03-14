package com.example.managementsystem.service;

import com.example.managementsystem.entity.CaseComplaintFile;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * 案件诉状文件服务接口
 */
public interface ICaseComplaintFileService {

    /**
     * 上传诉状文件
     *
     * @param caseId  案件ID
     * @param file    上传的文件
     * @param remark  备注
     * @param userId  上传人ID
     * @param userName 上传人姓名
     * @return 上传后的文件记录
     * @throws IOException IO异常
     */
    CaseComplaintFile uploadFile(Long caseId, MultipartFile file, String remark, Long userId, String userName) throws IOException;

    /**
     * 根据案件ID获取所有诉状文件
     *
     * @param caseId 案件ID
     * @return 文件列表
     */
    List<CaseComplaintFile> getFilesByCaseId(Long caseId);

    /**
     * 根据ID获取诉状文件
     *
     * @param id 文件ID
     * @return 文件记录
     */
    CaseComplaintFile getFileById(Long id);

    /**
     * 删除诉状文件
     *
     * @param id 文件ID
     * @return 是否成功
     */
    boolean deleteFile(Long id);

    /**
     * 更新文件备注
     *
     * @param id     文件ID
     * @param remark 备注
     * @return 是否成功
     */
    boolean updateRemark(Long id, String remark);

    /**
     * 下载/预览诉状文件（自动解密）
     *
     * @param id       文件ID
     * @param response HTTP响应
     * @throws IOException IO异常
     */
    void downloadFile(Long id, HttpServletResponse response) throws IOException;

    /**
     * 获取诉状文件字节数组（解密后）
     *
     * @param id 文件ID
     * @return 解密后的文件字节数组
     * @throws IOException IO异常
     */
    byte[] getFileBytes(Long id) throws IOException;
}
