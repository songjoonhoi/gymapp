package com.example.demo.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorage {
    /**
     * 파일을 저장하고 접근 가능한 URL을 반환
     */
    String save(MultipartFile file) throws IOException;

    /**
     * 로컬/S3에 저장된 파일을 삭제한다.
     * @param storedUrl save()가 리턴했던 저장 URL(예: "/media/uuid.jpg")
     */
    void delete(String path) throws IOException;
}
