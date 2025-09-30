package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@Profile("prod") // 운영 환경에서만 등록
public class AwsConfig {

    @Bean
    public S3Client s3Client() {
        return S3Client.create();
    }
}
