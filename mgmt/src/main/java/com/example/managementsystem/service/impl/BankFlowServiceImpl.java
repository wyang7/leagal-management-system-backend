package com.example.managementsystem.service.impl;

import com.example.managementsystem.dto.BankFlowPageRequest;
import com.example.managementsystem.entity.BankFlow;
import com.example.managementsystem.mapper.BankFlowMapper;
import com.example.managementsystem.service.IBankFlowService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class BankFlowServiceImpl implements IBankFlowService {

    @Autowired
    private BankFlowMapper bankFlowMapper;

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public Map<String, Object> page(BankFlowPageRequest request) {
        int pageNum = request == null || request.getPageNum() == null || request.getPageNum() < 1 ? 1 : request.getPageNum();
        int pageSize = request == null || request.getPageSize() == null || request.getPageSize() < 1 ? 10 : Math.min(request.getPageSize(), 100);
        int offset = (pageNum - 1) * pageSize;

        String keyword = request == null ? null : request.getKeyword();
        String caseNumber = request == null ? null : request.getCaseNumber();

        int total = bankFlowMapper.countBankFlows(keyword, caseNumber);
        List<BankFlow> records = bankFlowMapper.selectBankFlows(offset, pageSize, keyword, caseNumber);

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("records", records);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    @Override
    public BankFlow getById(Long id) {
        return id == null ? null : bankFlowMapper.selectById(id);
    }

    @Override
    public BankFlow create(BankFlow flow) {
        if (flow == null || !StringUtils.hasText(flow.getFlowNo())) {
            throw new IllegalArgumentException("流水号不能为空");
        }
        BankFlow exists = bankFlowMapper.selectByFlowNo(flow.getFlowNo());
        if (exists != null) {
            throw new IllegalArgumentException("流水号已存在");
        }
        String now = LocalDateTime.now().format(TS);
        flow.setCreatedTime(now);
        flow.setUpdatedTime(now);
        bankFlowMapper.insert(flow);
        return flow;
    }

    @Override
    public BankFlow update(BankFlow flow) {
        if (flow == null || flow.getId() == null) {
            throw new IllegalArgumentException("缺少ID");
        }
        BankFlow existing = bankFlowMapper.selectById(flow.getId());
        if (existing == null) {
            throw new IllegalArgumentException("记录不存在");
        }
        // 若修改了流水号，需校验唯一
        if (StringUtils.hasText(flow.getFlowNo()) && !flow.getFlowNo().equals(existing.getFlowNo())) {
            BankFlow byNo = bankFlowMapper.selectByFlowNo(flow.getFlowNo());
            if (byNo != null) {
                throw new IllegalArgumentException("流水号已存在");
            }
        }
        flow.setUpdatedTime(LocalDateTime.now().format(TS));
        bankFlowMapper.updateById(flow);
        return bankFlowMapper.selectById(flow.getId());
    }

    @Override
    public boolean delete(Long id) {
        if (id == null) return false;
        return bankFlowMapper.deleteById(id) > 0;
    }

    @Override
    public Map<String, Object> importExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        int success = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try (InputStream in = file.getInputStream(); Workbook wb = new XSSFWorkbook(in)) {
            Sheet sheet = wb.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalArgumentException("Excel为空");
            }

            // 新模板表头：流水号/交易时间/交易金额/付款方/收款方/交易渠道
            int startRow = 0;
            Row header = sheet.getRow(0);
            if (header != null) {
                String h0 = getCellString(header.getCell(0));
                if (h0 != null && h0.contains("流水")) {
                    startRow = 1;
                }
            }

            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row r = sheet.getRow(i);
                if (r == null) {
                    continue;
                }

                // 跳过空行：前6列都为空则跳过
                boolean allEmpty = true;
                for (int c = 0; c < 6; c++) {
                    String v = getCellString(r.getCell(c));
                    if (org.springframework.util.StringUtils.hasText(v)) {
                        allEmpty = false;
                        break;
                    }
                }
                if (allEmpty) {
                    continue;
                }

                try {
                    BankFlow bf = new BankFlow();
                    bf.setFlowNo(getCellString(r.getCell(0)));
                    bf.setTradeTime(getCellString(r.getCell(1)));
                    bf.setTradeAmount(getCellBigDecimal(r.getCell(2)));
                    bf.setPayer(getCellString(r.getCell(3)));
                    bf.setPayee(normalizePayee(getCellString(r.getCell(4))));
                    bf.setChannel(normalizeChannel(getCellString(r.getCell(5))));

                    // 必填校验
                    if (!StringUtils.hasText(bf.getFlowNo())) {
                        throw new IllegalArgumentException("流水号为空");
                    }
                    if (!StringUtils.hasText(bf.getTradeTime())) {
                        throw new IllegalArgumentException("交易时间为空");
                    }
                    if (bf.getTradeAmount() == null) {
                        throw new IllegalArgumentException("交易金额为空");
                    }
                    if (!StringUtils.hasText(bf.getPayer())) {
                        throw new IllegalArgumentException("付款方为空");
                    }
                    if (!StringUtils.hasText(bf.getPayee())) {
                        throw new IllegalArgumentException("收款方为空");
                    }
                    if (!StringUtils.hasText(bf.getChannel())) {
                        throw new IllegalArgumentException("交易渠道为空");
                    }

                    // upsert：按 flow_no 作为唯一键
                    BankFlow exists = bankFlowMapper.selectByFlowNo(bf.getFlowNo());
                    String now = LocalDateTime.now().format(TS);
                    if (exists == null) {
                        bf.setCreatedTime(now);
                        bf.setUpdatedTime(now);
                        bankFlowMapper.insert(bf);
                    } else {
                        bf.setId(exists.getId());
                        bf.setCreatedTime(exists.getCreatedTime());
                        bf.setUpdatedTime(now);
                        // 保留旧字段（历史数据）：收款账号/案件号（新模板不维护）
                        bf.setPayeeAccount(exists.getPayeeAccount());
                        bf.setCaseNumber(exists.getCaseNumber());
                        bankFlowMapper.updateById(bf);
                    }
                    success++;
                } catch (Exception ex) {
                    failed++;
                    errors.add("第" + (i + 1) + "行：" + (ex.getMessage() == null ? "导入失败" : ex.getMessage()));
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("解析Excel失败：" + e.getMessage());
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("failed", failed);
        res.put("errors", errors);
        return res;
    }

    @Override
    public List<BankFlow> listForExport(String keyword, String caseNumber) {
        // 直接拉取最多 10000 条（足够覆盖目前场景）
        return bankFlowMapper.selectBankFlows(0, 10000, keyword, caseNumber);
    }

    private String normalizePayee(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String v = raw.trim();
        // 允许用户输入 1/2/3 或直接输入名称
        if ("1".equals(v)) v = "青枫";
        if ("2".equals(v)) v = "澎和工作室";
        if ("3".equals(v)) v = "澎和信息";

        if ("青枫".equals(v) || "澎和工作室".equals(v) || "澎和信息".equals(v)) {
            return v;
        }
        throw new IllegalArgumentException("收款方不合法（仅允许：青枫、澎和工作室、澎和信息）");
    }

    private String normalizeChannel(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String v = raw.trim();
        if ("1".equalsIgnoreCase(v)) v = "支付宝";
        if ("2".equalsIgnoreCase(v)) v = "微信";
        if ("3".equalsIgnoreCase(v)) v = "对公";

        if ("支付宝".equals(v) || "微信".equals(v) || "对公".equals(v)
        ||"系统内清算资金往来-全渠道收单平台".equals(v) || "系统内资金清算往来".equals(v)) {
            return v;
        }
        throw new IllegalArgumentException("交易渠道不合法（仅允许：支付宝、微信、对公）");
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.STRING) {
                String v = cell.getStringCellValue();
                return v == null ? null : v.trim();
            }
            if (cell.getCellType() == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    // 日期时间统一格式化
                    return cell.getLocalDateTimeCellValue().format(TS);
                }
                double d = cell.getNumericCellValue();
                if (Math.floor(d) == d) {
                    return String.valueOf((long) d);
                }
                return String.valueOf(d);
            }
            if (cell.getCellType() == CellType.BOOLEAN) {
                return String.valueOf(cell.getBooleanCellValue());
            }
            if (cell.getCellType() == CellType.FORMULA) {
                try {
                    return cell.getStringCellValue();
                } catch (Exception ignore) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ignore2) {
                        return null;
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private BigDecimal getCellBigDecimal(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return new BigDecimal(String.valueOf(cell.getNumericCellValue())).setScale(2, BigDecimal.ROUND_HALF_UP);
            }
            if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue();
                if (!StringUtils.hasText(s)) return null;
                return new BigDecimal(s.trim()).setScale(2, BigDecimal.ROUND_HALF_UP);
            }
            if (cell.getCellType() == CellType.FORMULA) {
                try {
                    return new BigDecimal(String.valueOf(cell.getNumericCellValue())).setScale(2, BigDecimal.ROUND_HALF_UP);
                } catch (Exception ignore) {
                    String s = cell.getStringCellValue();
                    if (!StringUtils.hasText(s)) return null;
                    return new BigDecimal(s.trim()).setScale(2, BigDecimal.ROUND_HALF_UP);
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
