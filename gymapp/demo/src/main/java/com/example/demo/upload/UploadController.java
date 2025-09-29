package com.example.demo.upload;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    // 업로드할 기본 경로 (운영 시 외부 경로 권장)
    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/images")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 없습니다.");
        }

        try {
            // 폴더 없으면 생성
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            // 파일명 생성 (UUID + 확장자)
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf(".");
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path targetPath = Paths.get(UPLOAD_DIR).resolve(newFilename);

            // 저장
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // URL 형태 반환 (ex: http://localhost:7777/uploads/파일명)
            String fileUrl = "/uploads/" + newFilename;

            return ResponseEntity.ok().body(fileUrl);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 업로드 실패: " + e.getMessage());
        }
    }
}
