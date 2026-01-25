package com.example.managementsystem.service;

import com.example.managementsystem.entity.SystemFile;

import java.util.List;

public interface ISystemFileService {

    List<SystemFile> listAll();

    /**
     * 按条件查询系统文件（均为可选条件）
     */
    List<SystemFile> listByFilters(String fileType, String secretLevel, String fileNameKeyword);

    SystemFile getById(Long id);

    boolean save(SystemFile file);

    boolean removeById(Long id);

    int countAll();

    boolean updateTypeAndSecret(Long id, String fileType, String secretLevel);
}
