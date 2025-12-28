package com.example.managementsystem.service;

import com.example.managementsystem.entity.SystemFile;

import java.util.List;

public interface ISystemFileService {

    List<SystemFile> listAll();

    SystemFile getById(Long id);

    boolean save(SystemFile file);

    boolean removeById(Long id);

    int countAll();
}

