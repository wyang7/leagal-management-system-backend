package com.example.managementsystem.mapper;

import com.example.managementsystem.entity.Task;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * <p>
 * 任务表 Mapper 接口
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface TaskMapper extends BaseMapper<Task> {

    /**
     * 查询所有任务总数
     */
    int countAllTasks(@Param("taskName") String taskName
            ,@Param("taskStatus") String taskStatus);

    /**
     * 获取某天某用户领取的任务数量
     * @param userId 用户ID
     * @param receiveDate 领取日期（LocalDate类型，仅包含年月日）
     * @return 任务数量
     */
    int countTasksReceivedByUser(
            @Param("userId") Long userId,
            @Param("receiveDate") LocalDate receiveDate
    );
    /**
     * 分页查询任务
     * @param offset 起始位置
     * @param pageSize 每页条数
     */
    List<Task> selectTaskPage(@Param("offset") int offset,
                              @Param("pageSize") int pageSize,
                              @Param("taskName") String taskName,
                              @Param("taskStatus") String taskStatus);

}
