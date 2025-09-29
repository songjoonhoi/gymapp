package com.example.demo.workout;

import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.storage.FileStorage;
import com.example.demo.workout.dto.WorkoutLogRequest;
import com.example.demo.workout.dto.WorkoutLogResponse;
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
public class WorkoutLogService {

    private final WorkoutLogRepository logRepo;
    private final MemberRepository memberRepo;
    private final FileStorage fileStorage; // LocalFileStorage 자동 주입

    public WorkoutLogResponse create(Long memberId, WorkoutLogRequest req) {
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

        WorkoutLog log = WorkoutLog.builder()
                .member(member)
                .title(req.title())
                .content(req.content())
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .build();

        logRepo.save(log);
        return toRes(log);
    }

    @Transactional(readOnly = true)
    public List<WorkoutLogResponse> listByMember(Long memberId) {
        return logRepo.findByMemberId(memberId).stream()
                .map(this::toRes)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WorkoutLogResponse> findAll(Pageable pageable) {
        return logRepo.findAll(pageable).map(this::toRes);
    }

    private WorkoutLogResponse toRes(WorkoutLog log) {
        String previewUrl = (log.getMediaUrl() != null)
                ? "/api/workout-logs/" + log.getId() + "/media"
                : null;

        return new WorkoutLogResponse(
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
