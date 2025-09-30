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
@Profile("local") // local 환경에서만 사용
public class LocalFileStorage implements FileStorage {

    private final Path uploadDir = Paths.get("uploads/media");

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "video/mp4");
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "mp4");

    @Override
    public String save(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                throw new RuntimeException("허용되지 않은 파일 타입: " + contentType);
            }

            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
                throw new RuntimeException("허용되지 않은 확장자: " + ext);
            }

            Files.createDirectories(uploadDir);
            String newName = UUID.randomUUID() + "." + ext.toLowerCase();
            Path target = uploadDir.resolve(newName).normalize();

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/media/" + newName;
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e); // ✅ RuntimeException으로 변환
        }
    }

    @Override
    public void delete(String url) {
        if (url == null) return;

        try {
            Path target = uploadDir.resolve(Paths.get(url).getFileName());
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패", e);
        }
    }
}
