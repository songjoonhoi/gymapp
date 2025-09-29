package com.example.demo.storage;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Component
@Profile("local")  // 👉 local 프로필에서만 활성화
public class LocalFileStorage implements FileStorage {

    private final Path uploadDir = Paths.get("uploads/media");

    // 허용된 MIME 타입
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "video/mp4");

    // 허용된 확장자
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "mp4");

    @Override
    public String save(MultipartFile file) throws IOException {
        // 1) MIME 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IOException("허용되지 않은 파일 타입: " + contentType);
        }

        // 2) 확장자 검증
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IOException("허용되지 않은 확장자: " + ext);
        }

        // 3) 저장 디렉토리 생성
        Files.createDirectories(uploadDir);

        // 4) 파일명 UUID 로 변환
        String newName = UUID.randomUUID() + "." + ext.toLowerCase();

        // 5) normalize() 로 안전한 경로 생성
        Path target = uploadDir.resolve(newName).normalize();

        // 6) 파일 저장 (덮어쓰기 방지 위해 REPLACE_EXISTING 사용 가능)
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // 접근 URL 반환
        return "/media/" + newName;
    }

     @Override
    public void delete(String path) throws IOException {
        Path target = uploadDir.resolve(path).normalize();
        Files.deleteIfExists(target);
    }

}
