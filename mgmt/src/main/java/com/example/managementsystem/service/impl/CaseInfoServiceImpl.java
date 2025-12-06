package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.service.ICaseInfoService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import com.example.managementsystem.dto.CasePageRequest; // new import

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

    @Autowired
    private IUserService userService;
    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;


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
    public CaseInfo getCaseById(Long caseId) {
        return baseMapper.selectByCaseId(caseId);
    }

    @Override
    public boolean receiveCase(Long caseId, Long userId, boolean isAssign) {

        if (!isAssign) {
            int count = baseMapper.countActiveByUserId(userId);
            if (count>4){
                return false;
            }
        }

        CaseInfo caseInfo = getById(caseId);
        if (caseInfo == null) {
            return false;
        }
        // 更新案件状态为"已领取"并绑定用户
        caseInfo.setStatus("已领取");
        if (isAssign){
            caseInfo.setReceiveType("assign");
        }else {
            caseInfo.setReceiveType("self_receive");
        }
        caseInfo.setReceiveTime(LocalDateTime.now());
        caseInfo.setUserId(userId);
        return updateById(caseInfo);
    }

    @Override
    public boolean updateCaseStatus(Long caseId, String status) {
        // 验证状态是否合法
        if ( !"待领取".equals(status) &&
            !"已领取".equals(status) && !"待结案".equals(status) && !"结案".equals(status)) {
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
    public List<CaseInfo> getAssistantCases(Long userId) {
        return baseMapper.selectAssistantCasesWithUsername(userId);
    }

    @Override
    public boolean returnCase(Long caseId, String returnReason) {
        CaseInfo caseInfo = getById(caseId);
        if (caseInfo == null) {
            return false;
        }

        // 验证状态是否为已领取
        if ((!"已领取".equals(caseInfo.getStatus()))&&(!"延期".equals(caseInfo.getStatus()))
                &&(!"反馈".equals(caseInfo.getStatus()))) {
            return false;
        }
        // 更新为退回状态
        return baseMapper.updateReturnStatus(caseId, "退回", returnReason) > 0;
    }

    @Override
    public String genCaseNumber(String courtReceiveTime) {
        // 生成规则：yyyy.MM.dd-序号（两位，不足补0）
        if (courtReceiveTime == null || courtReceiveTime.trim().isEmpty()) {
            throw new RuntimeException("收案时间不能为空");
        }
        // 查询当天最大编号
        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.likeRight("case_number", courtReceiveTime)
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
        return courtReceiveTime + "-" + sequenceStr;
    }

    @Override
    public Map<String, Object> getCasePage(CasePageRequest request) {
        if (request == null) { return Collections.emptyMap(); }
        Integer pageNum = request.getPageNum() == null || request.getPageNum() < 1 ? 1 : request.getPageNum();
        Integer pageSize = request.getPageSize() == null || request.getPageSize() < 1 ? 10 : Math.min(request.getPageSize(), 100);
        int offset = (pageNum - 1) * pageSize;
        String caseName = request.getCaseName();
        String status = request.getStatus();
        String userName = request.getUserName();
        String assistant = request.getAssistant();
        String receiveTimeStart = request.getReceiveTimeStart();
        String receiveTimeEnd = request.getReceiveTimeEnd();
        String caseNumber = request.getCaseNumber();
        String plaintiff = request.getPlaintiff();
        String defendant = request.getDefendant();
        String station = request.getStation();
        String sortField = request.getSortField();
        String sortOrder = request.getSortOrder();
        Boolean timeout = request.getTimeout();
        String keyword = request.getKeyword();
        // 用户ID解析
        Long userId = null;
        if (org.apache.poi.util.StringUtil.isNotBlank(userName)) {
            User user = userService.searchUserByUsername(userName);
            if (user == null) { return Collections.emptyMap(); }
            userId = user.getUserId();
        }
        Long assistantId = null;
        if (org.apache.poi.util.StringUtil.isNotBlank(assistant)) {
            User user = userService.searchUserByUsername(assistant);
            if (user == null) { return Collections.emptyMap(); }
            assistantId = user.getUserId();
        }
        // 超时逻辑复用
        if (timeout != null && timeout) {
            List<CaseInfo> candidateCases = baseMapper.selectCasePage(0, 10000, caseName, status, caseNumber, plaintiff, defendant,
                receiveTimeStart, receiveTimeEnd, assistantId, userId, station, sortField, sortOrder, keyword);
            List<CaseInfo> allRecords = new ArrayList<>();
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            for (CaseInfo caseInfo : candidateCases) {
                if (caseInfo.getReceiveTime() == null) { continue; }
                java.time.LocalDateTime receiveDate = caseInfo.getReceiveTime();
                long daysSinceReceived = java.time.Duration.between(receiveDate, now).toDays();
                String receiveType = caseInfo.getReceiveType();
                String caseStatus = caseInfo.getStatus();
                if ("self_receive".equals(receiveType)) {
                    if ("已领取".equals(caseStatus) && daysSinceReceived > 0 && daysSinceReceived <= 3) { allRecords.add(caseInfo); continue; }
                    if ("反馈".equals(caseStatus) && daysSinceReceived >= 12 && daysSinceReceived <= 15) { allRecords.add(caseInfo); continue; }
                }
                if ("assign".equals(receiveType) && ("已领取".equals(caseStatus) || "反馈".equals(caseStatus))) {
                    if (daysSinceReceived >= 7 && daysSinceReceived <= 10) { allRecords.add(caseInfo); }
                }
            }
            int total = allRecords.size();
            int toIndex = Math.min(offset + pageSize, total);
            List<CaseInfo> pageRecords = offset < toIndex ? allRecords.subList(offset, toIndex) : new ArrayList<>();
            Map<String, Object> result = new HashMap<>();
            result.put("total", total);
            result.put("records", pageRecords);
            result.put("pageNum", pageNum);
            result.put("pageSize", pageSize);
            return result;
        }
        int total = baseMapper.countAllCases(caseName, status, caseNumber, plaintiff, defendant, receiveTimeStart, receiveTimeEnd, assistantId, userId, station, keyword);
        List<CaseInfo> records = baseMapper.selectCasePage(offset, pageSize, caseName, status, caseNumber, plaintiff, defendant, receiveTimeStart, receiveTimeEnd, assistantId, userId, station, sortField, sortOrder, keyword);
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("records", records);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);

        return result;
    }

    @Override
    public int batchUpdateTaskId(List<Long> caseIds, Long taskId) {
        CaseInfo caseInfo = new CaseInfo();
        caseInfo.setTaskId(taskId);
        caseInfo.setUpdatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("case_id", caseIds);

        return baseMapper.update(caseInfo, queryWrapper);
    }

    @Override
    public int removeTaskId(Long caseId) {
        return baseMapper.removeTaskId(caseId);
    }

    @Override
    public List<CaseInfo> getCasesByStatusList(List<String> statusList,Integer taskId,String caseName,String station) {
        return baseMapper.selectByStatusList(statusList,taskId,caseName,station);
    }

    @Override
    public boolean save(CaseInfo caseInfo) {
        if (caseInfo==null) {
            return false;
        }
        if (caseInfo.getAssistantId()==null) {
            String caseLocation = caseInfo.getCaseLocation();
            User assistantByCaseLocation = userService.getAssistantByCaseLocation(caseLocation);
            if (assistantByCaseLocation != null) {
                caseInfo.setAssistantId(assistantByCaseLocation.getUserId());
            }
        }
        return super.save(caseInfo);
    }

    @Override
    public boolean completeCase(Long caseId, String completionRemark, String returnCourtTime, Long operatorId) {
        // 1. 校验案件是否存在
        CaseInfo caseInfo = getById(caseId);
        if (caseInfo == null) {
            return false;
        }
        // 2. 校验状态是否允许调解失败（根据业务规则调整，例如：已领取、待结案、反馈、退回等状态可转为失败）
        String currentStatus = caseInfo.getStatus();
        if (!"已领取".equals(currentStatus) && !"待结案".equals(currentStatus) && !"反馈".equals(currentStatus)
                 && !"退回".equals(currentStatus)) {
            return false;  // 不允许从当前状态转为失败
        }
        // 3. 更新案件状态和字段
        int rows = baseMapper.updateCompleteStatus(
                caseId,
                "调解失败",
                completionRemark,
                returnCourtTime
        );
        // 4. 补充案件历史操作记录
        if (rows > 0) {
            addCaseHistory(caseId, "调解失败", "调解失败", completionRemark, operatorId);
        }
        return rows > 0;
    }

    @Override
    public List<CaseInfo> getSelfReceivedCheckableCases() {
        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("receive_type", "self_receive")
                .in("status", Arrays.asList("已领取", "反馈"))
                .isNotNull("receive_time");
        return baseMapper.selectList(queryWrapper);
    }

    @Override
    public List<CaseInfo> getAssignedCheckableCases() {
        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("receive_type", "assign")
                .in("status", Arrays.asList("已领取", "反馈"))
                .isNotNull("receive_time");
        return baseMapper.selectList(queryWrapper);
    }

    @Override
    public int batchUpdateReturnCourtTime(List<Long> caseIds, String returnCourtTime) {
        if (caseIds == null || caseIds.isEmpty() || returnCourtTime == null || returnCourtTime.isEmpty()) {
            return 0;
        }
        CaseInfo caseInfo = new CaseInfo();
        caseInfo.setReturnCourtTime(returnCourtTime);
        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("case_id", caseIds)
            .in("status", Arrays.asList("待结案", "调解失败", "结案")); // 只允许待结案和失败状态批量写入
        return baseMapper.update(caseInfo, queryWrapper);
    }

    @Override
    public void addCaseHistory(Long caseId, String action, String afterStatus, String remarks, Long operatorId) {
        CaseInfo caseInfo = getById(caseId);
        String beforeStatus = caseInfo != null ? caseInfo.getStatus() : null;
        String operatorName = null;
        if (operatorId != null) {
            User user = userService.getById(operatorId);
            operatorName = user != null ? user.getUsername() : null;
        }
        caseFlowHistoryService.saveHistory(
            caseId,
            operatorId,
            operatorName,
            action,
            beforeStatus,
            afterStatus,
            remarks
        );
    }

    @Override
    public int batchUpdateStatus(List<Integer> caseIds, String status, String completionRemark,Long operatorId) {
        int count = 0;
        for (Integer id : caseIds) {
            CaseInfo caseInfo = getById(id.longValue());
            if (caseInfo != null) {
                caseInfo.setStatus(status);
                caseInfo.setCompletionRemark(completionRemark);
                caseInfo.setUpdatedTime(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                boolean success = updateById(caseInfo);
                if (success) {
                    count++;
                    // 写入案件操作历史
                    addCaseHistory(caseInfo.getCaseId(), "批量调解失败", status, completionRemark, operatorId);
                }
            }
        }
        return count;
    }

    @Override
    public Integer getMaxReceiptNumber() {
        return baseMapper.selectMaxReceiptNumber();
    }

    @Override
    public Integer getMaxPengheCaseNumber() {
        return baseMapper.selectMaxPengheCaseNumber();
    }

    @Override
    public String getMaxReceiptNumberForBenbu() {
        return baseMapper.selectMaxReceiptNumberForBenbu();
    }

    @Override
    public String getMaxReceiptNumberForKaixuan() {
        return baseMapper.selectMaxReceiptNumberForKaixuan();
    }

    @Override
    public String getMaxReceiptNumberForZhanongkou() {
        return baseMapper.selectMaxReceiptNumberForZhanongkou();
    }
}
