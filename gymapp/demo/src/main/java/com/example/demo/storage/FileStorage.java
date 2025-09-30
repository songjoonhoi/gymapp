package com.example.demo.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorage {
    String save(MultipartFile file);  // ✅ throws 제거
    void delete(String url);
}
