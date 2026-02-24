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
}
