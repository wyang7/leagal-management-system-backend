package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.service.ICaseInfoService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.managementsystem.service.IUserService;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.sql.Date;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

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
        return baseMapper.selectById(caseId);
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
        if (StringUtils.isEmpty(courtReceiveTime)) {
            throw new RuntimeException("收案时间不能为空");
        }
//        java.time.LocalDate today = java.time.LocalDate.now();
//        String datePrefix = today.format(java.time.format.DateTimeFormatter.ofPattern("yyyy.MM.dd"));
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
    public Map<String, Object> getCasePage(String caseName,String status ,String userName,String assistant,String receiveTime,
                                           String caseNumber, String plaintiff, String defendant,String station
                                            ,Integer pageNum, Integer pageSize) {
        // 计算分页起始位置(MyBatis中通常从0开始)
        int offset = (pageNum - 1) * pageSize;
        Long userId=null;
        if (null!=userName){
            User user = userService.searchUserByUsername(userName);
            if (user == null) {
                return null;
            }
            userId = user.getUserId();
        }
        Long assistantId=null;
        if (null!=assistant){
            User user = userService.searchUserByUsername(assistant);
            if (user == null) {
                return null;
            }
            assistantId = user.getUserId();
        }


        // 查询总条数
        int total = baseMapper.countAllCases(caseName,status, caseNumber, plaintiff, defendant,receiveTime,assistantId,userId,station);

        // 查询当前页数据
        List<CaseInfo> records = baseMapper.selectCasePage(offset, pageSize,caseName,status
                , caseNumber, plaintiff, defendant,receiveTime,assistantId,userId,station);

        // 封装分页结果
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
    public boolean completeCase(Long caseId, String completionRemark, String returnCourtTime) {
        // 1. 校验案件是否存在
        CaseInfo caseInfo = getById(caseId);
        if (caseInfo == null) {
            return false;
        }

        // 2. 校验状态是否允许完结（根据业务规则调整，例如：已领取、已完成等状态可转为完结）
        String currentStatus = caseInfo.getStatus();
        if (!"已领取".equals(currentStatus) && !"已完成".equals(currentStatus) && !"反馈".equals(currentStatus)
                 && !"退回".equals(currentStatus)) {
            return false;  // 不允许从当前状态转为完结
        }

        // 3. 更新案件状态和字段
        int rows = baseMapper.updateCompleteStatus(
                caseId,
                "完结",  // 目标状态
                completionRemark,
                returnCourtTime
        );

        return rows > 0;
    }

    @Override
    public List<CaseInfo> getSelfReceivedCheckableCases() {
        QueryWrapper<CaseInfo> queryWrapper = new QueryWrapper<>();
        // 只查询“自行领取”的案件
        queryWrapper.eq("receive_type", "self_receive")
                // 状态为“已领取”或“反馈”（需要检查的状态）
                .in("status", Arrays.asList("已领取", "反馈"))
                // 必须有领取时间（排除异常数据）
                .isNotNull("receive_time");
        return baseMapper.selectList(queryWrapper);
    }

}
