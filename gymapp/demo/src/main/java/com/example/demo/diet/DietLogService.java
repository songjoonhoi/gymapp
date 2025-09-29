package com.example.demo.diet;

import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.storage.FileStorage;
import com.example.demo.diet.dto.DietLogRequest;
import com.example.demo.diet.dto.DietLogResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DietLogService {

    private final DietLogRepository logRepo;
    private final MemberRepository memberRepo;
    private final FileStorage fileStorage;

    public DietLogResponse create(Long memberId, DietLogRequest req) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원 없음: " + memberId));

        String mediaUrl = null;
        String mediaType = null;
        MultipartFile file = req.media();

        if (file != null && !file.isEmpty()) {
            try {
                mediaUrl = fileStorage.save(file);
                String contentType = file.getContentType();
                mediaType = (contentType != null && contentType.startsWith("video")) ? "VIDEO" : "IMAGE";
            } catch (IOException e) {
                throw new RuntimeException("파일 저장 실패", e);
            }
        }

        DietLog log = DietLog.builder()
                .member(member)
                .title(req.title())
                .content(req.content())
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .build();

        logRepo.save(log);
        return toRes(log);
    }

    public DietLogResponse update(Long logId, DietLogRequest req) {
        DietLog log = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("식단일지 없음: " + logId));

        log.setTitle(req.title());
        log.setContent(req.content());

        MultipartFile newMedia = req.media();
        if (newMedia != null && !newMedia.isEmpty()) {
            try {
                fileStorage.delete(log.getMediaUrl());
                String newUrl = fileStorage.save(newMedia);
                log.setMediaUrl(newUrl);
                String ct = newMedia.getContentType();
                log.setMediaType((ct != null && ct.startsWith("video")) ? "VIDEO" : "IMAGE");
            } catch (IOException e) {
                throw new RuntimeException("파일 교체 실패", e);
            }
        }

        return toRes(log);
    }

    public void delete(Long logId) {
        DietLog log = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("식단일지 없음: " + logId));
        try {
            fileStorage.delete(log.getMediaUrl());
        } catch (IOException e) {
            // 파일 삭제 실패해도 DB 삭제는 진행
        }
        logRepo.delete(log);
    }

    @Transactional(readOnly = true)
    public List<DietLogResponse> listByMember(Long memberId) {
        return logRepo.findByMemberId(memberId).stream()
                .map(this::toRes)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<DietLogResponse> findAll(Pageable pageable) {
        return logRepo.findAll(pageable).map(this::toRes);
    }

    private DietLogResponse toRes(DietLog log) {
        String previewUrl = (log.getMediaUrl() != null)
                ? "/api/diet-logs/" + log.getId() + "/media"
                : null;

        return new DietLogResponse(
                log.getId(),
                log.getMember().getId(),
                log.getTitle(),
                log.getContent(),
                previewUrl,
                log.getMediaType(),
                log.getCreatedAt()
        );
    }
}
