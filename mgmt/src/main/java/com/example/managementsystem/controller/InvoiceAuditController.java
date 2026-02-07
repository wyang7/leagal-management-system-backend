package com.example.managementsystem.controller;

import com.example.managementsystem.adapter.OssFileStorageAdapter;
import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.CaseCloseExtDTO;
import com.example.managementsystem.dto.InvoiceCasePageRequest;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.CaseCloseExt;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.mapper.CaseCloseExtMapper;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.IInvoiceManagementService;
import com.example.managementsystem.service.InvoicePdfService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.InputStream;
import java.util.Map;

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

    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;

    private final ObjectMapper objectMapper = new ObjectMapper();


    @Autowired
    private IInvoiceManagementService invoiceManagementService;

    /**
     * 开票管理分页查询（仅管理员可用）
     */
    @PostMapping("/page")
    public Result<Map<String, Object>> getInvoicePage(@RequestBody InvoiceCasePageRequest request, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleType() == null
                || (!currentUser.getRoleType().contains("管理员") && !currentUser.getRoleType().contains("财务"))) {
            return Result.fail("无权限");
        }
        Map<String, Object> page = invoiceManagementService.getInvoiceCasePage(request);
        return Result.success(page);
    }

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
        if (currentUser == null || currentUser.getRoleType() == null ||
                (!currentUser.getRoleType().contains("管理员") && !currentUser.getRoleType().contains("财务"))) {
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
        String beforeStatus = caseInfo.getStatus();

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

        // 记录历史流转：完成开票
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();
        String remarks = "已上传发票PDF";
        caseFlowHistoryService.saveHistory(caseId, operatorId, operatorName,
                "完成开票", beforeStatus, beforeStatus, remarks);

        return Result.success(objectName);
    }

    /**
     * 打回待开票申请：仅管理员/财务可用。
     * 行为：
     * - 将 invoiceStatus 从 “待开票” 改为 “暂未申请开票”
     * - 保留原有发票信息与付款流水，仅状态回退
     * - 记录打回原因到 completionNotes 追加一行（带时间）、或日志
     */
    @PostMapping("/reject")
    @Transactional
    public Result<?> rejectInvoice(@RequestBody Map<String, Object> body, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleType() == null ||
                (!currentUser.getRoleType().contains("管理员") && !currentUser.getRoleType().contains("财务"))) {
            return Result.fail("无权限");
        }
        Object caseIdObj = body.get("caseId");
        if (caseIdObj == null) {
            return Result.fail("缺少案件ID");
        }
        Long caseId;
        try {
            caseId = Long.valueOf(caseIdObj.toString());
        } catch (NumberFormatException e) {
            return Result.fail("案件ID不合法");
        }
        String reason = body.get("reason") == null ? null : body.get("reason").toString();
        if (reason == null || reason.trim().isEmpty()) {
            return Result.fail("打回原因不能为空");
        }

        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        String beforeStatus = caseInfo.getStatus();

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

        // 仅允许待开票状态被打回
        if (!"待开票".equals(ext.getInvoiceStatus())) {
            return Result.fail("当前开票状态为：" + (ext.getInvoiceStatus() == null ? "-" : ext.getInvoiceStatus()) + "，不允许打回");
        }

        // 仅回退 invoiceStatus，不再写入 completion_notes
        ext.setInvoiceStatus("开票被打回");

        try {
            caseInfo.setCaseCloseExt(objectMapper.writeValueAsString(ext));
        } catch (Exception e) {
            log.error("序列化结案扩展信息失败", e);
            return Result.fail("保存失败");
        }

        String now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        caseInfo.setUpdatedTime(now);
        boolean ok = caseInfoService.updateById(caseInfo);
        if (!ok) {
            return Result.fail("保存失败");
        }

        // 双写到 case_close_ext，新 completionNotes 直接来自 ext（未追加打回原因）
        CaseCloseExt existing = caseCloseExtMapper.selectByCaseId(caseId);
        CaseCloseExt entity = existing != null ? existing : new CaseCloseExt();
        entity.setCaseId(caseId);
        entity.setCompletionNotes(ext.getCompletionNotes());
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
            log.warn("rejectInvoice: paymentFlows 序列化失败 caseId={}", caseId);
        }
        if (existing == null) {
            entity.setCreatedTime(now);
            entity.setUpdatedTime(now);
            caseCloseExtMapper.insert(entity);
        } else {
            entity.setUpdatedTime(now);
            caseCloseExtMapper.updateById(entity);
        }

        // 记录历史流转：开票打回
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();
        caseFlowHistoryService.saveHistory(caseId, operatorId, operatorName,
                "开票打回", beforeStatus, beforeStatus, reason.trim());

        return Result.success();
    }

    /**
     * 已开票：上传新的发票PDF（覆盖原文件），仅管理员/财务可用。
     */
    @PostMapping("/update-pdf")
    @Transactional
    public Result<?> updateInvoicePdf(@RequestParam("caseId") Long caseId,
                                      @RequestParam("file") MultipartFile file,
                                      HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleType() == null ||
                (!currentUser.getRoleType().contains("管理员") && !currentUser.getRoleType().contains("财务"))) {
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
        String beforeStatus = caseInfo.getStatus();

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

        if (!"已开票".equals(ext.getInvoiceStatus())) {
            return Result.fail("当前开票状态为：" + (ext.getInvoiceStatus() == null ? "-" : ext.getInvoiceStatus()) + "，仅已开票案件可修改发票PDF");
        }

        String objectName = invoicePdfService.buildInvoicePdfObjectName(originalName, caseId);
        try (InputStream in = file.getInputStream()) {
            OssFileStorageAdapter.upload(in, objectName);
        } catch (Exception e) {
            log.error("更新发票PDF失败 caseId={}, objectName={}", caseId, objectName, e);
            return Result.fail("更新发票PDF失败");
        }

        ext.setInvoicePdf(objectName);
        String now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        try {
            caseInfo.setCaseCloseExt(objectMapper.writeValueAsString(ext));
        } catch (Exception e) {
            log.error("序列化结案扩展信息失败", e);
            return Result.fail("保存失败");
        }

        caseInfo.setUpdatedTime(now);
        boolean ok = caseInfoService.updateById(caseInfo);
        if (!ok) {
            return Result.fail("保存失败");
        }

        CaseCloseExt existing = caseCloseExtMapper.selectByCaseId(caseId);
        CaseCloseExt entity = existing != null ? existing : new CaseCloseExt();
        entity.setCaseId(caseId);
        entity.setCompletionNotes(ext.getCompletionNotes());
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
            log.warn("updateInvoicePdf: paymentFlows 序列化失败 caseId={}", caseId);
        }
        if (existing == null) {
            entity.setCreatedTime(now);
            entity.setUpdatedTime(now);
            caseCloseExtMapper.insert(entity);
        } else {
            entity.setUpdatedTime(now);
            caseCloseExtMapper.updateById(entity);
        }

        // 记录历史流转：更新开票信息
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();
        String remarks = "更新发票PDF";
        caseFlowHistoryService.saveHistory(caseId, operatorId, operatorName,
                "更新开票信息", beforeStatus, beforeStatus, remarks);

        return Result.success(objectName);
    }

    /**
     * 已开票：删除发票PDF，不改变开票状态，仅清空 invoicePdf 字段。
     */
    @PostMapping("/delete-pdf")
    @Transactional
    public Result<?> deleteInvoicePdf(@RequestBody Map<String, Object> body, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleType() == null ||
                (!currentUser.getRoleType().contains("管理员") && !currentUser.getRoleType().contains("财务"))) {
            return Result.fail("无权限");
        }
        Object caseIdObj = body.get("caseId");
        if (caseIdObj == null) {
            return Result.fail("缺少案件ID");
        }
        Long caseId;
        try {
            caseId = Long.valueOf(caseIdObj.toString());
        } catch (NumberFormatException e) {
            return Result.fail("案件ID不合法");
        }

        CaseInfo caseInfo = caseInfoService.getById(caseId);
        if (caseInfo == null) {
            return Result.fail("案件不存在");
        }
        String beforeStatus = caseInfo.getStatus();

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

        if (!"已开票".equals(ext.getInvoiceStatus())) {
            return Result.fail("当前开票状态为：" + (ext.getInvoiceStatus() == null ? "-" : ext.getInvoiceStatus()) + "，仅已开票案件可删除发票PDF");
        }

        // 清空 PDF 字段
        ext.setInvoicePdf(null);
        String now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        try {
            caseInfo.setCaseCloseExt(objectMapper.writeValueAsString(ext));
        } catch (Exception e) {
            log.error("序列化结案扩展信息失败", e);
            return Result.fail("保存失败");
        }

        caseInfo.setUpdatedTime(now);
        boolean ok = caseInfoService.updateById(caseInfo);
        if (!ok) {
            return Result.fail("保存失败");
        }

        CaseCloseExt existing = caseCloseExtMapper.selectByCaseId(caseId);
        CaseCloseExt entity = existing != null ? existing : new CaseCloseExt();
        entity.setCaseId(caseId);
        entity.setCompletionNotes(ext.getCompletionNotes());
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
            log.warn("deleteInvoicePdf: paymentFlows 序列化失败 caseId={}", caseId);
        }
        if (existing == null) {
            entity.setCreatedTime(now);
            entity.setUpdatedTime(now);
            caseCloseExtMapper.insert(entity);
        } else {
            entity.setUpdatedTime(now);
            caseCloseExtMapper.updateById(entity);
        }

        // 记录历史流转：删除开票信息
        Long operatorId = currentUser.getUserId();
        String operatorName = currentUser.getUsername();
        String remarks = "删除发票PDF";
        caseFlowHistoryService.saveHistory(caseId, operatorId, operatorName,
                "删除开票信息", beforeStatus, beforeStatus, remarks);

        return Result.success();
    }
}
