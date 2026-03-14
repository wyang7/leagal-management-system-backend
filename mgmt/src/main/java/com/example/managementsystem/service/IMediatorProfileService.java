package com.example.managementsystem.service;

import com.example.managementsystem.dto.MediatorProfileDTO;

import java.util.List;

/**
 * 调解员画像服务接口
 */
public interface IMediatorProfileService {

    /**
     * 获取单个调解员的能力画像
     *
     * @param userId 用户ID
     * @return 能力画像数据
     */
    MediatorProfileDTO getMediatorProfile(Long userId);

    /**
     * 获取所有调解员的画像列表
     *
     * @return 画像列表
     */
    List<MediatorProfileDTO> getAllMediatorProfiles();

    /**
     * 获取调解员排名（按综合得分）
     *
     * @param limit 取前N名
     * @return 排名列表
     */
    List<MediatorProfileDTO> getTopMediators(int limit);
}
