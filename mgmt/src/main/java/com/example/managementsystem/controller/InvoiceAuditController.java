package com.example.managementsystem.controller;

import com.example.managementsystem.adapter.OssFileStorageAdapter;
import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.CaseCloseExtDTO;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.CaseCloseExt;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.mapper.CaseCloseExtMapper;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.InvoicePdfService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.InputStream;

/**
 * 开票审核：上传发票PDF并把开票状态置为已开票
 *
 * @author Copilot
 */
@RestController
@RequestMapping("/invoice")
@Slf4j
public class InvoiceAuditController {

    @Autowired
    private ICaseInfoService caseInfoService;

    @Autowired
    private InvoicePdfService invoicePdfService;

    @Autowired
    private CaseCloseExtMapper caseCloseExtMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 开票审核：仅管理员可执行。
     * 前端表单参数：
     * - caseId
     * - file (pdf)
     */
    @PostMapping("/audit")
    @Transactional
    public Result<?> auditInvoice(@RequestParam("caseId") Long caseId,
                                 @RequestParam("file") MultipartFile file,
                                 HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleType() == null || !currentUser.getRoleType().contains("管理员")) {
            return Result.fail("无权限");
        }
        if (caseId == null) {
            return Result.fail("缺少案件ID");
        }
        if (file == null || file.isEmpty()) {
            return Result.fail("请上传发票PDF");
        }
        String originalName = file.getOriginalFilename();
        String lower = originalName == null ? "" : originalName.toLowerCase();
        if (!lower.endsWith(".pdf")) {
            return Result.fail("仅支持上传PDF文件");
        }

        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }

        CaseCloseExtDTO ext = null;
        try {
            if (caseInfo.getCaseCloseExt() != null && !caseInfo.getCaseCloseExt().isEmpty()) {
                ext = objectMapper.readValue(caseInfo.getCaseCloseExt(), CaseCloseExtDTO.class);
            }
        } catch (Exception e) {
            log.error("解析结案扩展信息失败", e);
        }
        if (ext == null) {
            ext = new CaseCloseExtDTO();
        }

        // 只允许待开票 -> 已开票
        if (!"待开票".equals(ext.getInvoiceStatus())) {
            return Result.fail("当前开票状态为：" + (ext.getInvoiceStatus() == null ? "-" : ext.getInvoiceStatus()) + "，不允许开票审核");
        }

        // 上传 PDF 到 OSS
        String objectName = invoicePdfService.buildInvoicePdfObjectName(originalName,caseId);
        try (InputStream in = file.getInputStream()) {
            OssFileStorageAdapter.upload(in, objectName);
        } catch (Exception e) {
            log.error("上传发票PDF失败 caseId={}, objectName={}", caseId, objectName, e);
            return Result.fail("上传发票PDF失败");
        }

        // 写入 ext：invoicePdf + invoiceStatus
        ext.setInvoicePdf(objectName);
        ext.setInvoiceStatus("已开票");

        try {
            caseInfo.setCaseCloseExt(objectMapper.writeValueAsString(ext));
        } catch (Exception e) {
            log.error("序列化结案扩展信息失败", e);
            return Result.fail("保存失败");
        }

        // 更新 case_info
        caseInfo.setUpdatedTime(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        boolean ok = caseInfoService.updateById(caseInfo);
        if (!ok) {
            return Result.fail("保存失败");
        }

        // 双写到新表 case_close_ext
        CaseCloseExt existing = caseCloseExtMapper.selectByCaseId(caseId);
        CaseCloseExt entity = existing != null ? existing : new CaseCloseExt();
        entity.setCaseId(caseId);
        entity.setSignDate(ext.getSignDate());
        entity.setAdjustedAmount(ext.getAdjustedAmount());
        entity.setMediationFee(ext.getMediationFee());
        entity.setPlaintiffMediationFee(ext.getPlaintiffMediationFee());
        entity.setDefendantMediationFee(ext.getDefendantMediationFee());
        entity.setPayer(ext.getPayer());
        entity.setInvoiceStatus(ext.getInvoiceStatus());
        entity.setPaid(ext.getPaid());
        entity.setInvoiced(ext.getInvoiced());
        entity.setInvoiceInfo(ext.getInvoiceInfo());
        entity.setInvoicePdf(ext.getInvoicePdf());
        try {
            entity.setPaymentFlows(ext.getPaymentFlows() == null ? null : objectMapper.writeValueAsString(ext.getPaymentFlows()));
        } catch (Exception e) {
            log.warn("开票审核：paymentFlows 序列化失败 caseId={}", caseId);
        }
        String now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        if (existing == null) {
            entity.setCreatedTime(now);
            entity.setUpdatedTime(now);
            caseCloseExtMapper.insert(entity);
        } else {
            entity.setUpdatedTime(now);
            caseCloseExtMapper.updateById(entity);
        }

        return Result.success(objectName);
    }
}
