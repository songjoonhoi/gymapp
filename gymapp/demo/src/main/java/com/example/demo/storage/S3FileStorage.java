package com.example.demo.storage;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Component
@Profile("prod")  // 👉 prod 프로필에서만 활성화
public class S3FileStorage implements FileStorage {

    // TODO: AmazonS3 클라이언트 주입 필요
    // private final AmazonS3 s3Client;
    // private final String bucketName = "your-bucket-name";

    @Override
    public String save(MultipartFile file) throws IOException {
        // 👉 뼈대 코드: 아직 실제 업로드는 구현하지 않음
        throw new UnsupportedOperationException("S3 업로드는 아직 구현되지 않았습니다.");
    }

    @Override
    public void delete(String path) throws IOException {
        // 👉 뼈대 코드: 아직 실제 삭제는 구현하지 않음
        throw new UnsupportedOperationException("S3 삭제는 아직 구현되지 않았습니다.");
    }
}
