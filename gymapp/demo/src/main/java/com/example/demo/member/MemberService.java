package com.example.demo.member;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository repo;
    private final PasswordEncoder passwordEncoder;

    // ✅ 회원 생성
    public MemberResponse create(MemberCreateRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        Member m = Member.builder()
                .name(req.name())
                .email(req.email())
                .phone(req.phone())
                .password(passwordEncoder.encode(req.password()))
                .role(req.role() == null ? Role.OT : req.role())
                .status(UserStatus.ACTIVE)
                .build();

        return toRes(repo.save(m));
    }

    @Transactional(readOnly = true)
    public MemberResponse get(Long id) {
        return toRes(find(id));
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> list(Pageable pageable) {
        return repo.findAll(pageable).map(this::toRes);
    }

    // ✅ 권한 적용된 조회
    @Transactional(readOnly = true)
    public MemberResponse getWithPermission(Long id, UserPrincipal user) {
        MemberResponse mr = get(id);
        if (user.isAdmin() || user.getId().equals(id)) {
            return mr;
        }
        if (user.isTrainer() && mr.trainerId() != null && mr.trainerId().equals(user.getId())) {
            return mr;
        }
        throw new AccessDeniedException("접근 권한이 없습니다.");
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> listWithPermission(Pageable pageable, UserPrincipal user) {
        if (!user.isAdmin()) {
            throw new AccessDeniedException("관리자만 전체 목록을 조회할 수 있습니다.");
        }
        return list(pageable);
    }

    // ✅ 비밀번호 변경 (권한 체크 포함)
    public void changePasswordWithPermission(Long memberId, PasswordChangeRequest req, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(memberId)) {
            changePassword(memberId, req);
            return;
        }
        throw new AccessDeniedException("본인만 비밀번호를 변경할 수 있습니다.");
    }

    public void changePassword(Long memberId, PasswordChangeRequest req) {
        Member m = find(memberId);

        if (!passwordEncoder.matches(req.currentPassword(), m.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        m.setPassword(passwordEncoder.encode(req.newPassword()));
    }

    // ✅ 회원 정보 수정
    public MemberResponse update(Long id, MemberUpdateRequest req) {
        Member m = find(id);

        if (req.name() != null) m.setName(req.name());

        if (req.phone() != null) {
            if (repo.existsByPhone(req.phone()) && !req.phone().equals(m.getPhone())) {
                throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
            }
            m.setPhone(req.phone());
        }

        if (req.role() != null) m.setRole(req.role());

        return toRes(m);
    }

    // 권한 포함 업데이트
    public MemberResponse updateWithPermission(Long id, MemberUpdateRequest req, UserPrincipal user) {
        // 1. 관리자는 모든 사용자 정보를 수정할 수 있습니다.
        if (user.isAdmin()) {
            return update(id, req);
        }
        
        // 2. 트레이너는 다른 사용자 정보를 수정할 수 있습니다 (예: 등급 변경).
        if (user.isTrainer()) {
            // (추가 개선 가능: 트레이너가 자신의 담당 회원만 수정하도록 제한할 수도 있습니다.)
            return update(id, req);
        }
        
        // 3. 일반 사용자는 자신의 정보만 수정할 수 있습니다.
        if (user.getId().equals(id)) {
            return update(id, req);
        }

        // 위 조건에 모두 해당하지 않으면 권한 없음 예외를 발생시킵니다.
        throw new AccessDeniedException("회원 정보를 수정할 권한이 없습니다.");
    }

    // ✅ 소프트 삭제
    public void delete(Long id) {
        repo.delete(find(id));
    }

    // ✅ 권한 포함 삭제
    public void deleteWithPermission(Long id, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(id)) {
            delete(id);
            return;
        }
        throw new AccessDeniedException("본인만 삭제할 수 있습니다.");
    }

    private Member find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + id));
    }

    private MemberResponse toRes(Member m) {
        return new MemberResponse(
                m.getId(),
                m.getName(),
                m.getEmail(),
                m.getPhone(),
                m.getRole(),
                m.getStatus(),
                m.getCreatedAt(),
                m.getUpdatedAt(),
                m.getTrainer() != null ? m.getTrainer().getId() : null
        );
    }

    // ✅ 트레이너 배정/변경
    public void assignTrainer(Long memberId, Long trainerId) {
        Member member = find(memberId);
        Member trainer = find(trainerId);

        if (!trainer.getRole().isTrainer()) {
            throw new IllegalArgumentException("선택된 회원은 트레이너가 아닙니다.");
        }

        member.setTrainer(trainer);
        repo.save(member);
    }

    // ✅ 트레이너 담당 회원 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> getTraineesWithPermission(Long trainerId, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(trainerId)) {
            return getTrainees(trainerId);
        }
        throw new AccessDeniedException("자신의 회원만 조회할 수 있습니다.");
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getTrainees(Long trainerId) {
        return repo.findByTrainerId(trainerId)
                .stream()
                .map(this::toRes)
                .toList();
    }

    // ✅ Excel 파일로 회원 일괄 등록 (속도 개선 버전)
    public void createMembersFromExcel(MultipartFile file, UserPrincipal user) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            Member trainer = find(user.getId());
            
            // 1. 엑셀 전체 전화번호 추출
            Set<String> excelPhones = new HashSet<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String phone = getCellValue(row.getCell(3));
                if (phone != null && !phone.trim().isEmpty()) {
                    excelPhones.add(phone);
                }
            }
            
            // 2. DB에서 이미 존재하는 전화번호 한 번에 조회
            Set<String> existingPhones = new HashSet<>(
                repo.findAll().stream()
                    .map(Member::getPhone)
                    .filter(phone -> phone != null && excelPhones.contains(phone))
                    .toList()
            );
            
            // 3. 새 회원만 필터링
            List<Member> newMembers = new ArrayList<>();
            Set<String> processedPhones = new HashSet<>();
            
            int successCount = 0;
            int skipCount = 0;
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    String name = getCellValue(row.getCell(0));
                    String phone = getCellValue(row.getCell(3));
                    
                    if (name == null || name.trim().isEmpty() || 
                        phone == null || phone.trim().isEmpty()) {
                        skipCount++;
                        continue;
                    }
                    
                    // 엑셀 내부 중복 체크
                    if (processedPhones.contains(phone)) {
                        skipCount++;
                        continue;
                    }
                    
                    // DB 중복 체크 (메모리에서)
                    if (existingPhones.contains(phone)) {
                        System.out.println("DB 중복으로 건너뜀: " + phone);
                        skipCount++;
                        continue;
                    }
                    
                    processedPhones.add(phone);
                    
                    String tempEmail = phone + "@gymapp.com";
                    
                    Member newMember = Member.builder()
                            .name(name)
                            .phone(phone)
                            .email(tempEmail)
                            .password(passwordEncoder.encode("1234"))
                            .role(Role.OT)
                            .status(UserStatus.ACTIVE)
                            .trainer(trainer)
                            .build();
                    
                    newMembers.add(newMember);
                    successCount++;
                    
                } catch (Exception e) {
                    System.err.println("행 " + (i+1) + " 처리 중 오류: " + e.getMessage());
                    skipCount++;
                }
            }
            
            // 새 회원 일괄 저장
            if (!newMembers.isEmpty()) {
                repo.saveAll(newMembers);
            }
            
            System.out.println("=== Excel 업로드 완료 ===");
            System.out.println("성공: " + successCount + "명");
            System.out.println("건너뜀: " + skipCount + "명");
        }
    }

    // ✅ 헬퍼: 셀 값을 String으로 변환
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        
        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue().trim();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getDateCellValue().toString();
                    }
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    }
                    return String.valueOf(numericValue);
                case BOOLEAN:
                    return String.valueOf(cell.getBooleanCellValue());
                case BLANK:
                    return "";
                default:
                    return "";
            }
        } catch (Exception e) {
            System.err.println("셀 값 읽기 오류: " + e.getMessage());
            return "";
        }
    }
}