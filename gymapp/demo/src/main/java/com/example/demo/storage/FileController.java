package com.example.demo.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.storage.dto.FileUploadResponse;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    // ✅ 파일 업로드
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @PostMapping("/upload")
    public FileUploadResponse upload(@RequestParam MultipartFile file) {
        return fileService.upload(file);
    }

    // ✅ 파일 삭제
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @DeleteMapping
    public void delete(@RequestParam String url) {
        fileService.delete(url);
    }
}
