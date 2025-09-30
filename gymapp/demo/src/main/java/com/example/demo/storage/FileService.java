package com.example.demo.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.storage.dto.FileUploadResponse;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileStorage fileStorage;

    public FileUploadResponse upload(MultipartFile file) {
        try {
            String url = fileStorage.save(file);
            return new FileUploadResponse(
                    url,
                    file.getOriginalFilename(),
                    file.getContentType()
            );
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    public void delete(String url) {
        fileStorage.delete(url);
    }
}
