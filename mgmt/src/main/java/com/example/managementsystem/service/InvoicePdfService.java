package com.example.managementsystem.service;

/**
 * 发票 PDF 存储相关工具（当前使用 OSS objectName）。
 *
 * @author Copilot
 */
public interface InvoicePdfService {

    /**
     * 生成发票 PDF 的 OSS objectName。
     */
    String buildInvoicePdfObjectName(String originalFilename,Long caseId);
}

