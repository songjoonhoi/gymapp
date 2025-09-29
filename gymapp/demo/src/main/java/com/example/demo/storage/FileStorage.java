package com.example.demo.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorage {
    /**
     * 파일을 저장하고 접근 가능한 URL을 반환
     */
    String save(MultipartFile file) throws IOException;
}
