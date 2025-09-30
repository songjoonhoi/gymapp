package com.example.demo.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Component
@Profile("prod") // prod 환경에서만 사용
public class S3FileStorage implements FileStorage {

    private final S3Client s3Client;
    private final String bucket;

    public S3FileStorage(S3Client s3Client,
                         @Value("${cloud.aws.s3.bucket}") String bucket) {
        this.s3Client = s3Client;
        this.bucket = bucket;
    }

    @Override
    public String save(MultipartFile file) {
        try {
            String ext = getExtension(file.getOriginalFilename());
            String key = "uploads/" + UUID.randomUUID() + "." + ext;

            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return "https://" + bucket + ".s3.amazonaws.com/" + key;
        } catch (IOException e) {
            throw new RuntimeException("S3 업로드 실패", e); // ✅ RuntimeException 변환
        }
    }

    @Override
    public void delete(String url) {
        if (url == null) return;

        String key = url.substring(url.indexOf("uploads/"));
        DeleteObjectRequest delReq = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3Client.deleteObject(delReq);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
