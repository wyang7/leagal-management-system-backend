package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.MediatorProfileDTO;
import com.example.managementsystem.service.IMediatorProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 调解员画像控制器
 */
@RestController
@RequestMapping("/mediator-profile")
@Slf4j
public class MediatorProfileController {

    @Autowired
    private IMediatorProfileService mediatorProfileService;

    /**
     * 获取单个调解员画像
     *
     * @param userId 用户ID
     * @return 调解员画像数据
     */
    @GetMapping("/{userId}")
    public Result<MediatorProfileDTO> getMediatorProfile(@PathVariable Long userId) {
        log.info("获取调解员画像, userId: {}", userId);
        try {
            MediatorProfileDTO profile = mediatorProfileService.getMediatorProfile(userId);
            if (profile == null) {
                return Result.fail(404, "未找到该调解员信息");
            }
            return Result.success(profile);
        } catch (Exception e) {
            log.error("获取调解员画像失败", e);
            return Result.fail(500, "获取调解员画像失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有调解员画像列表
     *
     * @return 调解员画像列表
     */
    @GetMapping("/list")
    public Result<List<MediatorProfileDTO>> getAllMediatorProfiles() {
        log.info("获取所有调解员画像列表");
        try {
            List<MediatorProfileDTO> profiles = mediatorProfileService.getAllMediatorProfiles();
            return Result.success(profiles);
        } catch (Exception e) {
            log.error("获取调解员画像列表失败", e);
            return Result.fail(500, "获取调解员画像列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取调解员排名（按综合得分）
     *
     * @param limit 取前N名（默认10）
     * @return 排名列表
     */
    @GetMapping("/top")
    public Result<List<MediatorProfileDTO>> getTopMediators(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("获取调解员排名, limit: {}", limit);
        try {
            List<MediatorProfileDTO> topMediators = mediatorProfileService.getTopMediators(limit);
            return Result.success(topMediators);
        } catch (Exception e) {
            log.error("获取调解员排名失败", e);
            return Result.fail(500, "获取调解员排名失败: " + e.getMessage());
        }
    }
}
