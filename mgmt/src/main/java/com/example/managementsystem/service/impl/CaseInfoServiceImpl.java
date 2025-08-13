package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.service.ICaseInfoService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import java.util.List;

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

    @Override
    public List<CaseInfo> getCasesByUserId(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public List<CaseInfo> getCasesByStatus(String status) {
        return baseMapper.selectByStatus(status);
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
}
