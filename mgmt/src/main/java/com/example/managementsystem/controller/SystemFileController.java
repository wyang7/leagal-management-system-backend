package com.example.managementsystem.controller;

import com.example.managementsystem.adapter.OssFileStorageAdapter;
import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.SystemFile;
import com.example.managementsystem.service.ISystemFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/systemFile")
public class SystemFileController {

    @Resource
    private ISystemFileService systemFileService;

    // 上传根目录：支持通过配置 file.upload.root 覆盖，默认使用当前工作目录下的 uploads
    // 例如：应用在 /opt/app/mgmt 启动，则默认目录为 /opt/app/mgmt/uploads
    @Value("${file.upload.root:uploads}")
    private String uploadRoot;

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024; // 10MB

    /**
     * 统一获取上传根目录（绝对路径）。
     * 若配置的是相对路径，则基于 JVM 的 user.dir 解析。
     */
    private File getUploadRootDir() {
        File root = new File(uploadRoot);
        if (!root.isAbsolute()) {
            String userDir = System.getProperty("user.dir");
            root = new File(userDir, uploadRoot);
        }
        return root;
    }

    @GetMapping
    public Result<List<SystemFile>> listAll() {
        return Result.success(systemFileService.listAll());
    }

    /**
     * 上传系统文件：仅管理员角色可用
     */
    @PostMapping("/upload")
    public Result<?> upload(@RequestParam("file") MultipartFile file,
                            @RequestParam("fileType") String fileType,
                            @RequestParam("secretLevel") String secretLevel,
                            HttpSession session) throws IOException {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null) {
            return Result.fail("未登录");
        }
        if (currentUser.getRoleType() == null || !currentUser.getRoleType().contains("管理员")) {
            return Result.fail("无权限，仅管理员可以上传文件");
        }

        if (file == null || file.isEmpty()) {
            return Result.fail("文件不能为空");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return Result.fail("文件大小不能超过10MB");
        }

        String originalName = file.getOriginalFilename();
        String ext = StringUtils.getFilenameExtension(originalName);
        String lowerExt = ext == null ? "" : ext.toLowerCase(Locale.ROOT);
        if (!("pdf".equals(lowerExt) || "doc".equals(lowerExt) || "docx".equals(lowerExt))) {
            return Result.fail("只支持上传pdf、doc、docx文件");
        }

        int total = systemFileService.countAll();
        if (total >= 100) {
            return Result.fail("系统文件数量已达上限100个，请先删除后再上传");
        }

        // 统一使用 OSS 存储，路径前缀为 system/
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String storedName = uuid + "." + lowerExt;
        String ossObjectName = "system/" + storedName;

        // 通过 OssFileStorageAdapter 上传到 OSS
        OssFileStorageAdapter.upload(file.getInputStream(), ossObjectName);

        // 数据库中只记录 OSS 中的对象名，方便下载时直接使用
        SystemFile systemFile = new SystemFile();
        systemFile.setFileName(originalName);
        systemFile.setFileType(fileType);
        systemFile.setSecretLevel(secretLevel);
        systemFile.setFilePath(ossObjectName);
        systemFile.setUploader(currentUser.getUsername());
        systemFile.setUploadTime(new Timestamp(System.currentTimeMillis()));

        systemFileService.save(systemFile);
        return Result.success(true);
    }

    /**
     * 删除系统文件：仅管理员角色
     */
    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null) {
            return Result.fail("未登录");
        }
        if (currentUser.getRoleType() == null || !currentUser.getRoleType().contains("管理员")) {
            return Result.fail("无权限，仅管理员可以删除文件");
        }
        SystemFile file = systemFileService.getById(id);
        if (file == null) {
            return Result.fail("文件不存在");
        }
        // 这里只删除数据库记录，物理文件可选择保留或后续补充删除逻辑
        systemFileService.removeById(id);
        return Result.success(true);
    }

    /**
     * 下载系统文件：所有角色可下载
     */
    @GetMapping("/download/{id}")
    public void download(@PathVariable Long id, HttpServletResponse response) throws IOException {
        SystemFile file = systemFileService.getById(id);
        if (file == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        String objectName = file.getFilePath();
        if (objectName == null || objectName.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        response.setContentType("application/octet-stream");
        String encodedName = URLEncoder.encode(file.getFileName(), StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");
        response.setHeader("Content-Disposition", "attachment; filename=" + encodedName);

        // 直接从 OSS 读取并写入响应输出流
        try {
            OssFileStorageAdapter.download(objectName, response.getOutputStream());
        } catch (RuntimeException e) {
            response.reset();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
