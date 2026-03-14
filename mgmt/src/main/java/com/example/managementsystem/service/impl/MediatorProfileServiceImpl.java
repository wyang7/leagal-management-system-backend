package com.example.managementsystem.service.impl;

import com.example.managementsystem.dto.MediatorProfileDTO;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.CaseCloseExtMapper;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.mapper.UserMapper;
import com.example.managementsystem.service.IMediatorProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 调解员画像服务实现类
 */
@Service
@Slf4j
public class MediatorProfileServiceImpl implements IMediatorProfileService {

    @Autowired
    private CaseInfoMapper caseInfoMapper;

    @Autowired
    private CaseCloseExtMapper caseCloseExtMapper;

    @Autowired
    private UserMapper userMapper;

    // 标的额区间定义
    private static final List<AmountRange> AMOUNT_RANGES = Arrays.asList(
            new AmountRange("小额", BigDecimal.ZERO, new BigDecimal("10000")),
            new AmountRange("中小额", new BigDecimal("10000"), new BigDecimal("50000")),
            new AmountRange("中额", new BigDecimal("50000"), new BigDecimal("200000")),
            new AmountRange("大额", new BigDecimal("200000"), new BigDecimal("500000")),
            new AmountRange("超大额", new BigDecimal("500000"), null)
    );

    // 可控制的失败原因（调解员可改善的）
    private static final List<String> CONTROLLABLE_FAILURES = Arrays.asList(
            "拒绝调解", "调解方案未达成一致", "当事人反悔", "调解技能不足"
    );

    // 不可控的失败原因
    private static final List<String> UNCONTROLLABLE_FAILURES = Arrays.asList(
            "联系不上"
    );

    // 反馈备注前缀
    private static final String FEEDBACK_PREFIX = "填写反馈备注：";

    @Override
    public MediatorProfileDTO getMediatorProfile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }

        // 获取该调解员所有已处理案件
        List<CaseInfo> cases = caseInfoMapper.selectByUserId(userId);

        MediatorProfileDTO profile = new MediatorProfileDTO();
        profile.setUserId(userId);
        profile.setUsername(user.getUsername());

        // 基础统计
        int totalCases = cases.size();
        int completedCases = (int) cases.stream()
                .filter(c -> "结案".equals(c.getStatus()))
                .count();

        profile.setTotalCases(totalCases);
        profile.setCompletedCases(completedCases);

        // 调解成功率
        BigDecimal successRate = totalCases > 0
                ? new BigDecimal(completedCases).multiply(new BigDecimal("100"))
                .divide(new BigDecimal(totalCases), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        profile.setSuccessRate(successRate);

        // 标的额区间分布
        profile.setAmountRangeStats(calculateAmountRangeStats(cases));

        // 案由分类统计
        profile.setCaseTypeStats(calculateCaseTypeStats(cases));

        // 调解费统计
        calculateMediationFeeStats(profile, cases);

        // 失败原因分析
        profile.setFailureReasonStats(calculateFailureReasonStats(cases));

        // 计算六维雷达图数据
        profile.setRadarData(calculateRadarData(profile, cases));

        // 平均调解天数
        profile.setAvgResolutionDays(calculateAvgResolutionDays(cases));

        return profile;
    }

    @Override
    public List<MediatorProfileDTO> getAllMediatorProfiles() {
        // 获取所有调解员（角色为调解员的用户）
        List<User> mediators = userMapper.selectAllMediators();

        if (mediators.isEmpty()) {
            return Collections.emptyList();
        }

        return mediators.stream()
                .map(u -> getMediatorProfile(u.getUserId()))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(this::getCompositeScore).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<MediatorProfileDTO> getTopMediators(int limit) {
        return getAllMediatorProfiles().stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 计算综合得分（用于排名）
     */
    private BigDecimal getCompositeScore(MediatorProfileDTO profile) {
        MediatorProfileDTO.RadarData radar = profile.getRadarData();
        if (radar == null) {
            return BigDecimal.ZERO;
        }
        return radar.getSuccessRateScore()
                .add(radar.getEfficiencyScore())
                .add(radar.getComplexityScore())
                .add(radar.getCoverageScore())
                .add(radar.getRevenueScore())
                .add(radar.getFailureResistScore())
                .divide(new BigDecimal("6"), 2, RoundingMode.HALF_UP);
    }

    /**
     * 计算标的额区间分布
     */
    private List<MediatorProfileDTO.AmountRangeStat> calculateAmountRangeStats(List<CaseInfo> cases) {
        List<MediatorProfileDTO.AmountRangeStat> stats = new ArrayList<>();

        for (AmountRange range : AMOUNT_RANGES) {
            List<CaseInfo> rangeCases = cases.stream()
                    .filter(c -> c.getAmount() != null)
                    .filter(c -> isInRange(c.getAmount(), range.min, range.max))
                    .collect(Collectors.toList());

            int count = rangeCases.size();
            int success = (int) rangeCases.stream()
                    .filter(c -> "结案".equals(c.getStatus()))
                    .count();

            MediatorProfileDTO.AmountRangeStat stat = new MediatorProfileDTO.AmountRangeStat();
            stat.setRangeName(range.name);
            stat.setMinAmount(range.min);
            stat.setMaxAmount(range.max);
            stat.setCaseCount(count);
            stat.setSuccessCount(success);
            stat.setSuccessRate(count > 0
                    ? new BigDecimal(success).multiply(new BigDecimal("100"))
                    .divide(new BigDecimal(count), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
            stats.add(stat);
        }

        return stats;
    }

    /**
     * 计算案由分类统计
     */
    private List<MediatorProfileDTO.CaseTypeStat> calculateCaseTypeStats(List<CaseInfo> cases) {
        Map<String, List<CaseInfo>> groupedByCaseName = cases.stream()
                .filter(c -> c.getCaseName() != null)
                .collect(Collectors.groupingBy(CaseInfo::getCaseName));

        List<MediatorProfileDTO.CaseTypeStat> stats = new ArrayList<>();

        for (Map.Entry<String, List<CaseInfo>> entry : groupedByCaseName.entrySet()) {
            List<CaseInfo> caseList = entry.getValue();

            MediatorProfileDTO.CaseTypeStat stat = new MediatorProfileDTO.CaseTypeStat();
            stat.setCaseName(entry.getKey());
            stat.setCaseCount(caseList.size());
            stat.setSuccessCount((int) caseList.stream()
                    .filter(c -> "结案".equals(c.getStatus()))
                    .count());

            // 平均标的额
            BigDecimal avgAmount = caseList.stream()
                    .filter(c -> c.getAmount() != null)
                    .map(CaseInfo::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(caseList.size()), 2, RoundingMode.HALF_UP);
            stat.setAvgAmount(avgAmount);

            stats.add(stat);
        }

        // 按案件数降序排序
        stats.sort(Comparator.comparing(MediatorProfileDTO.CaseTypeStat::getCaseCount).reversed());

        return stats;
    }

    /**
     * 计算调解费统计
     */
    private void calculateMediationFeeStats(MediatorProfileDTO profile, List<CaseInfo> cases) {
        // 从结案扩展表中查询调解费
        BigDecimal totalFee = BigDecimal.ZERO;
        int feeCount = 0;

        for (CaseInfo caseInfo : cases) {
            if (caseInfo.getCaseId() != null) {
                // 这里简化处理，实际可能需要关联查询case_close_ext表
                // 暂时用模拟数据
                totalFee = totalFee.add(new BigDecimal("500")); // 默认500
                feeCount++;
            }
        }

        profile.setTotalMediationFee(totalFee);
        profile.setAvgMediationFee(feeCount > 0
                ? totalFee.divide(new BigDecimal(feeCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
    }

    /**
     * 计算失败原因统计
     */
    private List<MediatorProfileDTO.FailureReasonStat> calculateFailureReasonStats(List<CaseInfo> cases) {
        // 统计失败的案件
        List<CaseInfo> failedCases = cases.stream()
                .filter(c -> !"结案".equals(c.getStatus()) && c.getCompletionRemark() != null)
                .collect(Collectors.toList());

        // 提取真实的失败原因（从"填写反馈备注："后面提取）
        Map<String, Long> reasonCounts = failedCases.stream()
                .map(c -> extractFailureReason(c.getCompletionRemark()))
                .collect(Collectors.groupingBy(reason -> reason, Collectors.counting()));

        int totalFailures = failedCases.size();
        List<MediatorProfileDTO.FailureReasonStat> stats = new ArrayList<>();

        for (Map.Entry<String, Long> entry : reasonCounts.entrySet()) {
            MediatorProfileDTO.FailureReasonStat stat = new MediatorProfileDTO.FailureReasonStat();
            String reason = entry.getKey();
            stat.setReason(reason);
            stat.setCount(entry.getValue().intValue());
            stat.setPercentage(totalFailures > 0
                    ? new BigDecimal(entry.getValue()).multiply(new BigDecimal("100"))
                    .divide(new BigDecimal(totalFailures), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
            // 判断是否可控：在可控列表中且不在不可控列表中
            stat.setControllable(CONTROLLABLE_FAILURES.contains(reason));
            stats.add(stat);
        }

        // 按次数降序排序
        stats.sort(Comparator.comparing(MediatorProfileDTO.FailureReasonStat::getCount).reversed());

        return stats;
    }

    /**
     * 从备注中提取失败原因
     * 格式："2025-12-05 10:38:55，郑楚雯，填写反馈备注：拒绝调解"
     * 提取"填写反馈备注："后面的内容
     */
    private String extractFailureReason(String completionRemark) {
        if (completionRemark == null || completionRemark.isEmpty()) {
            return "未知原因";
        }

        int index = completionRemark.indexOf(FEEDBACK_PREFIX);
        if (index >= 0) {
            // 提取"填写反馈备注："后面的内容
            String reason = completionRemark.substring(index + FEEDBACK_PREFIX.length()).trim();
            return reason.isEmpty() ? "未填写原因" : reason;
        }

        // 如果没有前缀，返回原始内容
        return completionRemark;
    }

    /**
     * 计算六维雷达图数据
     */
    private MediatorProfileDTO.RadarData calculateRadarData(MediatorProfileDTO profile, List<CaseInfo> cases) {
        MediatorProfileDTO.RadarData radar = new MediatorProfileDTO.RadarData();

        // 1. 调解成功率得分 (0-100)
        radar.setSuccessRateScore(profile.getSuccessRate());

        // 2. 调解效率得分（平均天数越少得分越高，使用平滑曲线）
        // 20天以内满分100，20-30天缓慢下降(95-100)，30-60天平滑下降，60天以上接近0
        BigDecimal avgDays = profile.getAvgResolutionDays();
        BigDecimal efficiencyScore = BigDecimal.ZERO;
        if (avgDays != null) {
            if (avgDays.compareTo(new BigDecimal("20")) <= 0) {
                // 20天以内：满分
                efficiencyScore = new BigDecimal("100");
            } else if (avgDays.compareTo(new BigDecimal("30")) <= 0) {
                // 20-30天：缓慢下降 100->95
                BigDecimal daysOver20 = avgDays.subtract(new BigDecimal("20"));
                efficiencyScore = new BigDecimal("100").subtract(
                    daysOver20.multiply(new BigDecimal("0.5")));
            } else if (avgDays.compareTo(new BigDecimal("60")) <= 0) {
                // 30-60天：平滑指数下降 95->20
                // 使用指数衰减公式：score = 95 * exp(-0.05 * (days - 30))
                double daysOver30 = avgDays.doubleValue() - 30;
                double score = 95 * Math.exp(-0.05 * daysOver30);
                efficiencyScore = new BigDecimal(score).setScale(2, RoundingMode.HALF_UP);
            } else if (avgDays.compareTo(new BigDecimal("90")) <= 0) {
                // 60-90天：缓慢下降至接近0
                BigDecimal daysOver60 = avgDays.subtract(new BigDecimal("60"));
                efficiencyScore = new BigDecimal("20").subtract(
                    daysOver60.multiply(new BigDecimal("0.6")));
                if (efficiencyScore.compareTo(BigDecimal.ZERO) < 0) {
                    efficiencyScore = BigDecimal.ZERO;
                }
            } else {
                // 90天以上：0分
                efficiencyScore = BigDecimal.ZERO;
            }
        }
        radar.setEfficiencyScore(efficiencyScore);

        // 3. 复杂度适应力得分（基于大额案件占比）
        List<MediatorProfileDTO.AmountRangeStat> amountStats = profile.getAmountRangeStats();
        BigDecimal complexityScore = BigDecimal.ZERO;
        if (amountStats != null) {
            int complexCases = amountStats.stream()
                    .filter(s -> "大额".equals(s.getRangeName()) || "超大额".equals(s.getRangeName()))
                    .mapToInt(MediatorProfileDTO.AmountRangeStat::getCaseCount)
                    .sum();
            int totalCases = amountStats.stream().mapToInt(MediatorProfileDTO.AmountRangeStat::getCaseCount).sum();
            complexityScore = totalCases > 0
                    ? new BigDecimal(complexCases).multiply(new BigDecimal("100"))
                    .divide(new BigDecimal(totalCases), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
        }
        radar.setComplexityScore(complexityScore.min(new BigDecimal("100")));

        // 4. 案件覆盖度得分（基于案由种类数和分布均衡性）
        List<MediatorProfileDTO.CaseTypeStat> caseTypeStats = profile.getCaseTypeStats();
        BigDecimal coverageScore = calculateCoverageScore(caseTypeStats);
        radar.setCoverageScore(coverageScore);

        // 5. 创收能力得分（平均调解费评级）
        BigDecimal avgFee = profile.getAvgMediationFee();
        BigDecimal revenueScore = BigDecimal.ZERO;
        if (avgFee != null) {
            revenueScore = avgFee.compareTo(new BigDecimal("2000")) >= 0 ? new BigDecimal("100")
                    : avgFee.compareTo(new BigDecimal("1000")) >= 0 ? new BigDecimal("70")
                    : avgFee.compareTo(new BigDecimal("500")) >= 0 ? new BigDecimal("40")
                    : new BigDecimal("20");
        }
        radar.setRevenueScore(revenueScore);

        // 6. 抗失败能力得分（可控失败占比越低得分越高）
        List<MediatorProfileDTO.FailureReasonStat> failureStats = profile.getFailureReasonStats();
        BigDecimal failureResistScore = new BigDecimal("100");
        if (failureStats != null) {
            int controllableFailures = failureStats.stream()
                    .filter(MediatorProfileDTO.FailureReasonStat::getControllable)
                    .mapToInt(MediatorProfileDTO.FailureReasonStat::getCount)
                    .sum();
            int totalFailures = failureStats.stream().mapToInt(MediatorProfileDTO.FailureReasonStat::getCount).sum();
            failureResistScore = totalFailures > 0
                    ? new BigDecimal("100").subtract(new BigDecimal(controllableFailures)
                    .multiply(new BigDecimal("100")).divide(new BigDecimal(totalFailures), 2, RoundingMode.HALF_UP))
                    : new BigDecimal("100");
        }
        radar.setFailureResistScore(failureResistScore);

        return radar;
    }

    /**
     * 计算平均调解天数
     */
    private BigDecimal calculateAvgResolutionDays(List<CaseInfo> cases) {
        List<Long> days = cases.stream()
                .filter(c -> "结案".equals(c.getStatus()))
                .filter(c -> c.getReceiveTime() != null && c.getUpdatedTime() != null)
                .map(c -> {
                    try {
                        LocalDateTime start = c.getReceiveTime();
                        LocalDateTime end = LocalDateTime.parse(c.getUpdatedTime(),
                                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        return ChronoUnit.DAYS.between(start, end);
                    } catch (Exception e) {
                        return 0L;
                    }
                })
                .filter(d -> d > 0)
                .collect(Collectors.toList());

        if (days.isEmpty()) {
            return BigDecimal.ZERO;
        }

        long totalDays = days.stream().mapToLong(Long::longValue).sum();
        return new BigDecimal(totalDays)
                .divide(new BigDecimal(days.size()), 2, RoundingMode.HALF_UP);
    }

    private boolean isInRange(BigDecimal amount, BigDecimal min, BigDecimal max) {
        if (max == null) {
            return amount.compareTo(min) >= 0;
        }
        return amount.compareTo(min) >= 0 && amount.compareTo(max) < 0;
    }

    /**
     * 标的额区间内部类
     */
    private static class AmountRange {
        String name;
        BigDecimal min;
        BigDecimal max;

        AmountRange(String name, BigDecimal min, BigDecimal max) {
            this.name = name;
            this.min = min;
            this.max = max;
        }
    }
}
