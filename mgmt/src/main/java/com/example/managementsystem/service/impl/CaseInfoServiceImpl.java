package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.service.ICaseInfoService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 案件表 服务实现类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Service
public class CaseInfoServiceImpl extends ServiceImpl<CaseInfoMapper, CaseInfo> implements ICaseInfoService {

    @Override
    public List<CaseInfo> getCasesByTaskId(Long taskId) {
        return baseMapper.selectByTaskId(taskId);
    }

    // 替换原有查询所有案件的方法
    @Override
    public List<CaseInfo> list() {
        return baseMapper.selectCasesWithUsername(); // 使用关联查询
    }

    @Override
    public List<CaseInfo> getCasesByUserId(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public List<CaseInfo> getCasesByStatus(String status) {
        return baseMapper.selectCasesByStatusWithUsername(status); // 使用关联查询
    }

    @Override
    public boolean receiveCase(Long caseId, Long userId) {
        CaseInfo caseInfo = getById(caseId);
        if (caseInfo == null) {
            return false;
        }
        
        // 检查案件当前状态是否为"待领取"
        if (!"待领取".equals(caseInfo.getStatus())) {
            return false;
        }
        
        // 更新案件状态为"已领取"并绑定用户
        caseInfo.setStatus("已领取");
        caseInfo.setUserId(userId);
        return updateById(caseInfo);
    }

    @Override
    public boolean updateCaseStatus(Long caseId, String status) {
        // 验证状态是否合法
        if (!"待发布".equals(status) && !"待领取".equals(status) && 
            !"已领取".equals(status) && !"已完成".equals(status)) {
            return false;
        }
        
        CaseInfo caseInfo = new CaseInfo();
        caseInfo.setCaseId(caseId);
        caseInfo.setStatus(status);
        return updateById(caseInfo);
    }

    // 添加：实现前缀搜索
    @Override
    public List<CaseInfo> searchCasesByCaseNamePrefix(String caseName) {
        return baseMapper.selectByCaseNameLikePrefix(caseName);
    }

    @Override
    public List<CaseInfo> getMyCases(Long userId) {
        return baseMapper.selectMyCasesWithUsername(userId);
    }


    @Override
    public String genCaseNumber() {
        // 生成规则：yyyy.MM.dd-序号（两位，不足补0）
        java.time.LocalDate today = java.time.LocalDate.now();
        String datePrefix = today.format(java.time.format.DateTimeFormatter.ofPattern("yyyy.MM.dd"));
        // 查询当天最大编号
        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.likeRight("case_number", datePrefix)
                .orderByDesc("case_number")
                .last("limit 1");
        CaseInfo lastCase = baseMapper.selectOne(queryWrapper);
        int sequenceNumber = 1;
        if (lastCase != null && lastCase.getCaseNumber() != null) {
            String[] parts = lastCase.getCaseNumber().split("-");
            if (parts.length == 2) {
                try {
                    sequenceNumber = Integer.parseInt(parts[1]) + 1;
                } catch (NumberFormatException ignored) {}
            }
        }
        String sequenceStr = String.format("%02d", sequenceNumber);
        return datePrefix + "-" + sequenceStr;
    }

    @Override
    public Map<String, Object> getCasePage(Integer pageNum, Integer pageSize) {
        // 计算分页起始位置(MyBatis中通常从0开始)
        int offset = (pageNum - 1) * pageSize;

        // 查询总条数
        int total = baseMapper.countAllCases();

        // 查询当前页数据
        List<CaseInfo> records = baseMapper.selectCasePage(offset, pageSize);

        // 封装分页结果
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("records", records);

        return result;
    }

}
