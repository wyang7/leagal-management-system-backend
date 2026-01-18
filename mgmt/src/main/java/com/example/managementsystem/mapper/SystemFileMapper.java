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

    int countAll();

    int updateTypeAndSecret(@Param("id") Long id,
                            @Param("fileType") String fileType,
                            @Param("secretLevel") String secretLevel);
}
