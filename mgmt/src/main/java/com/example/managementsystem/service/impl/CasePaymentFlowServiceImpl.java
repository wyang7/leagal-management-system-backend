package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.CasePaymentFlow;
import com.example.managementsystem.entity.BankFlow;
import com.example.managementsystem.mapper.CasePaymentFlowMapper;
import com.example.managementsystem.service.ICasePaymentFlowService;
import com.example.managementsystem.service.IBankFlowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CasePaymentFlowServiceImpl implements ICasePaymentFlowService {
    @Autowired
    private CasePaymentFlowMapper casePaymentFlowMapper;

    @Autowired
    private IBankFlowService bankFlowService;

    @Override
    @Transactional
    public void savePaymentFlows(Long caseId, List<CasePaymentFlow> flows) {
        // 原逻辑是：先根据 caseId 全量删除，再批量重新插入，会导致 ID 变化，
        // 对依赖 CasePaymentFlow.id 的外键或业务关联有破坏性，这里改为按主键做 upsert + 删除多余记录。
        if (caseId == null) {
            return;
        }

        // 1. 查询当前已存在的流水
        List<CasePaymentFlow> existing = casePaymentFlowMapper.selectByCaseId(caseId);

        // 2. 计算需要删除的旧记录（在新列表中已不存在的）
        if (existing != null && !existing.isEmpty()) {
            // 用于快速判断哪些 id 仍被保留
            java.util.Set<Long> keepIds = new java.util.HashSet<>();
            if (flows != null) {
                for (CasePaymentFlow f : flows) {
                    if (f.getId() != null) {
                        keepIds.add(f.getId());
                    }
                }
            }
            for (CasePaymentFlow old : existing) {
                Long oldId = old.getId();
                if (oldId != null && (keepIds.isEmpty() || !keepIds.contains(oldId))) {
                    // 新列表中不再包含该 id，则删除这条记录
                    casePaymentFlowMapper.deleteById(oldId);
                }
            }
        }

        // 3. 逐条保存：有 id 的走更新 / 覆盖（此处简化为先删后插，保持单条语义，不再全量删），无 id 的走插入
        if (flows != null && !flows.isEmpty()) {
            for (CasePaymentFlow flow : flows) {
                flow.setCaseId(caseId);
                if (flow.getId() == null) {
                    // 新增记录
                    casePaymentFlowMapper.insert(flow);
                } else {
                    // 已有记录，使用最简单的方式：按 id 先删再插，避免批量全删导致其他记录 ID 变动
                    casePaymentFlowMapper.deleteById(flow.getId());
                    casePaymentFlowMapper.insert(flow);
                }
            }
        }
    }

    @Override
    public void savePaymentFlow(CasePaymentFlow flow) {
        casePaymentFlowMapper.insert(flow);
    }

    @Override
    public List<CasePaymentFlow> getByCaseId(Long caseId) {
        List<CasePaymentFlow> flows = casePaymentFlowMapper.selectByCaseId(caseId);
        // 为每条付款流水补充绑定的银行流水信息（若存在）
        if (flows != null && !flows.isEmpty()) {
            for (CasePaymentFlow flow : flows) {
                if (flow.getId() == null) continue;
                try {
                    BankFlow bf = bankFlowService.getByCasePaymentId(flow.getId());
                    if (bf != null && bf.getCasePaymentId() != null) {
                        flow.setBankFlowId(bf.getId());
                        flow.setBankFlowNo(bf.getFlowNo());
                        flow.setBankFlowStatus(bf.getFlowStatus());
                    }
                } catch (Exception ignored) {
                    // 单条异常不影响整体
                }
            }
        }
        return flows;
    }

    @Override
    public void deleteByCaseId(Long caseId) {
        casePaymentFlowMapper.deleteByCaseId(caseId);
    }

    @Override
    @Transactional
    public void deleteByCaseIdAndIndex(Long caseId, int index) {
        List<CasePaymentFlow> flows = casePaymentFlowMapper.selectByCaseId(caseId);
        if (flows != null && index >= 0 && index < flows.size()) {
            Long id = flows.get(index).getId();
            if (id != null) {
                casePaymentFlowMapper.deleteById(id);
            }
        }
    }

    @Override
    public void deleteById(Long id) {
        casePaymentFlowMapper.deleteById(id);
    }
}
