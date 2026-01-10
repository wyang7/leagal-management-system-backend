package com.example.managementsystem.adapter;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.GetObjectRequest;
import com.aliyun.oss.model.OSSObject;
import com.aliyun.oss.model.PutObjectRequest;
import org.springframework.stereotype.Component;

import java.io.*;

/**
 * 文件存储适配器，基于阿里云 OSS，提供简单的文件上传和下载能力。
 *
 * 说明：
 * 1. bucketName 写死为 peng-he-oa；
 * 2. 作为 Spring 托管的组件暴露，同时提供静态工具方法，便于在非 Spring 环境直接调用；
 * 3. 入参根据业务侧（如 SystemFileController）的实际情况做适配。
 */
@Component
public class OssFileStorageAdapter {

    /**
     * 固定的 Bucket 名称
     */
    private static final String BUCKET_NAME = "peng-he-oa";

    /**
     * Spring 注入时使用的无参构造器
     */
    public OssFileStorageAdapter() {
    }

    // ===================== 对外静态工具方法 =====================

    /**
     * 以静态方式上传文件（底层复用 OssClientSingleton）。
     *
     * @param inputStream 要上传的输入流（调用方负责关闭）
     * @param objectName  OSS 上的对象名（路径），例如 "system/xxx.pdf"
     */
    public static void upload(InputStream inputStream, String objectName) {
        if (inputStream == null) {
            throw new IllegalArgumentException("inputStream must not be null");
        }
        if (objectName == null || objectName.trim().isEmpty()) {
            throw new IllegalArgumentException("objectName must not be blank");
        }
        OSS ossClient = OssClientSingleton.getInstance();
        try {
            PutObjectRequest request = new PutObjectRequest(BUCKET_NAME, objectName, inputStream);
            ossClient.putObject(request);
        } catch (Exception e) {
            throw new RuntimeException("上传文件到 OSS 失败: " + objectName, e);
        }
    }

    /**
     * 从 OSS 下载到响应的输出流中，适合直接写回 HttpServletResponse。
     *
     * @param objectName OSS 上的对象名
     * @param output     输出流（由调用方管理关闭）
     */
    public static void download(String objectName, OutputStream output) {
        if (objectName == null || objectName.trim().isEmpty()) {
            throw new IllegalArgumentException("objectName must not be blank");
        }
        if (output == null) {
            throw new IllegalArgumentException("output must not be null");
        }

        OSS ossClient = OssClientSingleton.getInstance();
        OSSObject ossObject = ossClient.getObject(new GetObjectRequest(BUCKET_NAME, objectName));
        try (InputStream in = ossObject.getObjectContent()) {
            byte[] buffer = new byte[8 * 1024];
            int len;
            while ((len = in.read(buffer)) != -1) {
                output.write(buffer, 0, len);
            }
            output.flush();
        } catch (IOException e) {
            throw new RuntimeException("从 OSS 下载文件失败: " + objectName, e);
        }
    }

    /**
     * 直接读取 OSS 上文件为字节数组。
     */
    public static byte[] readAsBytes(String objectName) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        download(objectName, out);
        return out.toByteArray();
    }

    // ===================== 保留基于 File 的便捷方法（如有需要） =====================

    /**
     * 兼容旧逻辑：使用 File 上传到 OSS。
     *
     * @param file       本地文件
     * @param objectName OSS 上对象名
     */
    public static void upload(File file, String objectName) {
        if (file == null) {
            throw new IllegalArgumentException("file must not be null");
        }
        if (!file.exists() || !file.isFile()) {
            throw new IllegalArgumentException("file does not exist or is not a regular file: " + file);
        }
        try (InputStream in = new FileInputStream(file)) {
            upload(in, objectName);
        } catch (IOException e) {
            throw new RuntimeException("上传文件到 OSS 失败: " + objectName, e);
        }
    }
}
