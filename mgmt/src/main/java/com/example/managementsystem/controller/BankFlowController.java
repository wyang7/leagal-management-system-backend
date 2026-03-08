package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.BankFlowPageRequest;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.BankFlow;
import com.example.managementsystem.service.IBankFlowService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bank-flow")
public class BankFlowController {

    @Autowired
    private IBankFlowService bankFlowService;

    @Autowired
    private com.example.managementsystem.mapper.CasePaymentFlowMapper casePaymentFlowMapper;

    @Autowired
    private com.example.managementsystem.mapper.CaseInfoMapper caseInfoMapper;

    private boolean canAccess(HttpSession session) {
        UserSession u = (UserSession) session.getAttribute("currentUser");
        if (u == null || u.getRoleType() == null) return false;
        return u.getRoleType().contains("管理员") || u.getRoleType().contains("财务");
    }

    @PostMapping("/page")
    public Result<Map<String, Object>> page(@RequestBody BankFlowPageRequest request, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        return Result.success(bankFlowService.page(request));
    }

    @GetMapping("/{id}")
    public Result<BankFlow> get(@PathVariable Long id, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        BankFlow bf = bankFlowService.getById(id);
        return bf != null ? Result.success(bf) : Result.fail("记录不存在");
    }

    @PostMapping("/create")
    public Result<BankFlow> create(@RequestBody BankFlow flow, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        try {
            return Result.success(bankFlowService.create(flow));
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/update")
    public Result<BankFlow> update(@RequestBody BankFlow flow, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        try {
            return Result.success(bankFlowService.update(flow));
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/delete")
    public Result<?> delete(@RequestBody Map<String, Object> body, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        Object idObj = body.get("id");
        if (idObj == null) {
            return Result.fail("缺少ID");
        }
        Long id;
        try {
            id = Long.parseLong(idObj.toString());
        } catch (NumberFormatException e) {
            return Result.fail("ID格式错误");
        }
        return bankFlowService.delete(id) ? Result.success() : Result.fail("删除失败");
    }

    @PostMapping("/import")
    public Result<Map<String, Object>> importExcel(@RequestParam("file") MultipartFile file, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        try {
            return Result.success(bankFlowService.importExcel(file));
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) {
        // 模板无需权限
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("银行流水导入模板");
            Row header = sheet.createRow(0);
            String[] headers = {"流水号", "交易时间", "交易金额", "付款方", "收款方（青枫、澎和工作室、澎和信息）", "交易渠道（支付宝、微信、对公、系统内资金清算往来、系统内清算资金往来-全渠道收单平台）"};
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            String filename = "银行流水导入模板.xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8.name()));
            workbook.write(response.getOutputStream());
            response.flushBuffer();
        } catch (Exception ignored) {
        }
    }

    @GetMapping("/export")
    public void export(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) String caseNumber,
                       HttpSession session,
                       HttpServletResponse response) {
        if (!canAccess(session)) {
            response.setStatus(403);
            return;
        }
        try {
            List<BankFlow> list = bankFlowService.listForExport(keyword, caseNumber);

            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("银行流水");
                Row header = sheet.createRow(0);
                String[] headers = {"流水号", "交易时间", "交易金额", "付款方", "收款方（青枫、澎和工作室、澎和信息）", "交易渠道（支付宝、微信、对公、系统内资金清算往来、系统内清算资金往来-全渠道收单平台）"};
                for (int i = 0; i < headers.length; i++) {
                    header.createCell(i).setCellValue(headers[i]);
                }

                int rowIdx = 1;
                for (BankFlow bf : list) {
                    Row r = sheet.createRow(rowIdx++);
                    int c = 0;
                    r.createCell(c++).setCellValue(bf.getFlowNo() == null ? "" : bf.getFlowNo());
                    r.createCell(c++).setCellValue(bf.getTradeTime() == null ? "" : bf.getTradeTime());
                    r.createCell(c++).setCellValue(bf.getTradeAmount() == null ? 0 : bf.getTradeAmount().doubleValue());
                    r.createCell(c++).setCellValue(bf.getPayer() == null ? "" : bf.getPayer());
                    r.createCell(c++).setCellValue(bf.getPayee() == null ? "" : bf.getPayee());
                    r.createCell(c++).setCellValue(bf.getChannel() == null ? "" : bf.getChannel());
                }
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                String filename = "银行流水_" + LocalDate.now() + ".xlsx";
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setHeader("Content-Disposition", "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8.name()));
                workbook.write(response.getOutputStream());
                response.flushBuffer();
            }
        } catch (Exception e) {
            response.setStatus(500);
        }
    }

    /**
     * 查询所有未绑定案件付款的银行流水（状态为"待案件匹配"）
     */
    @GetMapping("/unbound")
    public Result<List<BankFlow>> listUnboundFlows(HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        return Result.success(bankFlowService.listUnboundFlows());
    }

    /**
     * 根据ID查询银行流水
     */
    @GetMapping("/detail")
    public Result<BankFlow> getById(@RequestParam Long id, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        BankFlow flow = bankFlowService.getById(id);
        if (flow == null) {
            return Result.fail("记录不存在");
        }
        return Result.success(flow);
    }

    /**
     * 提交案件流水申请（更新银行流水状态和案件付款ID）
     */
    @PostMapping("/submit-application")
    public Result<BankFlow> submitCaseFlowApplication(@RequestBody Map<String, Object> params, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        Long bankFlowId = params.get("bankFlowId") != null ? Long.valueOf(params.get("bankFlowId").toString()) : null;
        Long casePaymentId = params.get("casePaymentId") != null ? Long.valueOf(params.get("casePaymentId").toString()) : null;
        String flowStatus = params.get("flowStatus") != null ? params.get("flowStatus").toString() : null;

        try {
            BankFlow updated = bankFlowService.submitCaseFlowApplication(bankFlowId, casePaymentId, flowStatus);
            return Result.success(updated);
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    /**
     * 审核银行流水申请
     */
    @PostMapping("/audit")
    public Result<BankFlow> auditBankFlow(@RequestBody Map<String, Object> params, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        Long bankFlowId = params.get("bankFlowId") != null ? Long.valueOf(params.get("bankFlowId").toString()) : null;
        Boolean approved = params.get("approved") != null ? Boolean.valueOf(params.get("approved").toString()) : null;

        if (bankFlowId == null) {
            return Result.fail("银行流水ID不能为空");
        }
        if (approved == null) {
            return Result.fail("审核结果不能为空");
        }

        try {
            BankFlow updated = bankFlowService.auditBankFlow(bankFlowId, approved);
            return Result.success(updated);
        } catch (IllegalArgumentException e) {
            return Result.fail(e.getMessage());
        }
    }

    /**
     * 获取银行流水审核详情（包含案件付款流水和案件基本信息）
     */
    @GetMapping("/audit-detail")
    public Result<Map<String, Object>> getAuditDetail(@RequestParam Long bankFlowId, HttpSession session) {
        if (!canAccess(session)) {
            return Result.fail("无权限");
        }
        if (bankFlowId == null) {
            return Result.fail("银行流水ID不能为空");
        }

        BankFlow bankFlow = bankFlowService.getById(bankFlowId);
        if (bankFlow == null) {
            return Result.fail("银行流水记录不存在");
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("bankFlow", bankFlow);

        // 查询关联的案件付款流水
        if (bankFlow.getCasePaymentId() != null) {
            com.example.managementsystem.entity.CasePaymentFlow paymentFlow =
                    casePaymentFlowMapper.selectById(bankFlow.getCasePaymentId());
            result.put("casePaymentFlow", paymentFlow);

            // 查询案件基本信息
            if (paymentFlow != null && paymentFlow.getCaseId() != null) {
                com.example.managementsystem.entity.CaseInfo caseInfo =
                        caseInfoMapper.selectByCaseId(paymentFlow.getCaseId());
                result.put("caseInfo", caseInfo);
            }
        }

        return Result.success(result);
    }
}
