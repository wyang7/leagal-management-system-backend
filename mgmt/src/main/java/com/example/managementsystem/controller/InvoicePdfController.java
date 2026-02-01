package com.example.managementsystem.controller;

import com.example.managementsystem.adapter.OssFileStorageAdapter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * 发票 PDF 读取（从 OSS 下载）
 *
 * @author Copilot
 */
@RestController
@RequestMapping("/case")
@Slf4j
public class InvoicePdfController {

    @GetMapping("/invoice-pdf")
    public void downloadInvoicePdf(@RequestParam("objectName") String objectName, HttpServletResponse response) throws IOException {
        if (objectName == null || objectName.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        // 仅允许 invoice/ 前缀
        if (!objectName.startsWith("invoice/")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        response.setContentType("application/pdf");
        // inline 方便在浏览器直接预览
        String fileName = objectName.substring(objectName.lastIndexOf('/') + 1);
        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");
        response.setHeader("Content-Disposition", "inline; filename=" + encodedName);

        try {
            OssFileStorageAdapter.download(objectName, response.getOutputStream());
        } catch (RuntimeException e) {
            log.error("读取发票PDF失败: {}", objectName, e);
            response.reset();
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}

