package com.example.managementsystem.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 调解员能力画像DTO
 * 六维能力模型数据
 */
@Data
public class MediatorProfileDTO {

    /** 调解员用户ID */
    private Long userId;

    /** 调解员姓名 */
    private String username;

    /** 总处理案件数 */
    private Integer totalCases;

    /** 结案数 */
    private Integer completedCases;

    /** 调解成功率 (0-100) */
    private BigDecimal successRate;

    /** 平均调解天数 */
    private BigDecimal avgResolutionDays;

    /** 标的额区间分布 */
    private List<AmountRangeStat> amountRangeStats;

    /** 案由分类统计 */
    private List<CaseTypeStat> caseTypeStats;

    /** 总调解费 */
    private BigDecimal totalMediationFee;

    /** 平均调解费 */
    private BigDecimal avgMediationFee;

    /** 六维能力雷达图数据 */
    private RadarData radarData;

    /** 失败原因分析 */
    private List<FailureReasonStat> failureReasonStats;

    /**
     * 标的额区间统计
     */
    @Data
    public static class AmountRangeStat {
        /** 区间名称 */
        private String rangeName;
        /** 区间下限 */
        private BigDecimal minAmount;
        /** 区间上限 */
        private BigDecimal maxAmount;
        /** 案件数量 */
        private Integer caseCount;
        /** 成功数 */
        private Integer successCount;
        /** 成功率 */
        private BigDecimal successRate;
    }

    /**
     * 案由类型统计
     */
    @Data
    public static class CaseTypeStat {
        /** 案由名称 */
        private String caseName;
        /** 案件数量 */
        private Integer caseCount;
        /** 成功数 */
        private Integer successCount;
        /** 平均标的额 */
        private BigDecimal avgAmount;
        /** 平均调解费 */
        private BigDecimal avgMediationFee;
    }

    /**
     * 雷达图数据
     */
    @Data
    public static class RadarData {
        /** 调解成功率得分 (0-100) */
        private BigDecimal successRateScore;
        /** 调解效率得分 (0-100) */
        private BigDecimal efficiencyScore;
        /** 复杂度适应力得分 (0-100) */
        private BigDecimal complexityScore;
        /** 案件覆盖度得分 (0-100) */
        private BigDecimal coverageScore;
        /** 创收能力得分 (0-100) */
        private BigDecimal revenueScore;
        /** 抗失败能力得分 (0-100) */
        private BigDecimal failureResistScore;
    }

    /**
     * 失败原因统计
     */
    @Data
    public static class FailureReasonStat {
        /** 失败原因 */
        private String reason;
        /** 次数 */
        private Integer count;
        /** 占比 */
        private BigDecimal percentage;
        /** 是否可控（调解员可改善） */
        private Boolean controllable;
    }
}
