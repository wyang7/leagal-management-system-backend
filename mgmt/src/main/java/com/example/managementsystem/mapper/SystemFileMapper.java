package com.example.managementsystem.mapper;

import com.example.managementsystem.entity.SystemFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SystemFileMapper {

    int insert(SystemFile file);

    int deleteById(@Param("id") Long id);

    SystemFile selectById(@Param("id") Long id);

    List<SystemFile> selectAll();

    /**
     * 按条件查询系统文件（均为可选条件）
     */
    List<SystemFile> selectByFilters(@Param("fileType") String fileType,
                                     @Param("secretLevel") String secretLevel,
                                     @Param("fileNameKeyword") String fileNameKeyword);

    int countAll();

    int updateTypeAndSecret(@Param("id") Long id,
                            @Param("fileType") String fileType,
                            @Param("secretLevel") String secretLevel);
}
