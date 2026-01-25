package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.SystemFile;
import com.example.managementsystem.mapper.SystemFileMapper;
import com.example.managementsystem.service.ISystemFileService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class SystemFileServiceImpl implements ISystemFileService {

    @Resource
    private SystemFileMapper systemFileMapper;

    @Override
    public List<SystemFile> listAll() {
        return systemFileMapper.selectAll();
    }

    @Override
    public List<SystemFile> listByFilters(String fileType, String secretLevel, String fileNameKeyword) {
        return systemFileMapper.selectByFilters(fileType, secretLevel, fileNameKeyword);
    }

    @Override
    public SystemFile getById(Long id) {
        return systemFileMapper.selectById(id);
    }

    @Override
    public boolean save(SystemFile file) {
        return systemFileMapper.insert(file) > 0;
    }

    @Override
    public boolean removeById(Long id) {
        return systemFileMapper.deleteById(id) > 0;
    }

    @Override
    public int countAll() {
        return systemFileMapper.countAll();
    }

    @Override
    public boolean updateTypeAndSecret(Long id, String fileType, String secretLevel) {
        return systemFileMapper.updateTypeAndSecret(id, fileType, secretLevel) > 0;
    }
}
