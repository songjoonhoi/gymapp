package com.example.demo.member;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.AccountStatus;
import com.example.demo.common.enums.Gender;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.time.LocalDate;
import java.time.Period;
import org.springframework.security.core.Authentication;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

    // ✅ 회원 생성 (핵심 수정!)
    public MemberResponse create(MemberCreateRequest req) {
        if (repo.existsByPhone(req.phone())) {
            throw new IllegalArgumentException("이미 사용중인 전화번호입니다.");
        }
        
        String email = req.email();
        if (email == null || email.isEmpty()) {
            email = req.phone() + "@gymapp.com";
        } else {
            if (repo.existsByEmail(email)) {
                throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
            }
        }
        
        String password = req.password();
        if (password == null || password.isEmpty()) {
            password = req.phone().substring(req.phone().length() - 4);
        }

        // ✨ [핵심 수정] 트레이너 배정 로직 변경
        Member trainer = null;
        
        // 1. 요청에 trainerId가 있으면 해당 트레이너 찾기
        if (req.trainerId() != null) {
            trainer = repo.findById(req.trainerId())
                    .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다: " + req.trainerId()));
            
            // 트레이너 권한 확인
            if (!trainer.getRole().isTrainer()) {
                throw new IllegalArgumentException("선택한 사용자는 트레이너가 아닙니다.");
            }
        } 
        // 2. trainerId가 없고, 현재 로그인한 사용자가 트레이너라면
        else {
            Member currentMember = getCurrentAuthenticatedMember();
            if (currentMember.getRole().isTrainer()) {
                trainer = currentMember;
            }
            // 관리자가 trainerId 없이 등록하면 trainer는 null
        }

        Member m = Member.builder()
                .name(req.name())
                .phone(req.phone())
                .email(email)
                .password(passwordEncoder.encode(password))
                .gender(req.gender())
                .dateOfBirth(req.dateOfBirth())
                .membershipType(req.membershipType())
                .registrationDate(req.registrationDate())
                .startDate(req.startDate())
                .role(req.role() == null ? Role.OT : req.role())
                .status(UserStatus.ACTIVE)
                .accountStatus(AccountStatus.PENDING)
                .trainer(trainer)  // ✅ 올바른 트레이너 설정
                .build();

        Member saved = repo.save(m);
        return toRes(saved);
    }

    private Member getCurrentAuthenticatedMember() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            return repo.findById(principal.getId())
                    .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
        }
        throw new IllegalStateException("인증되지 않은 사용자입니다.");
    }

    @Transactional(readOnly = true)
    public MemberResponse get(Long id) {
        return toRes(find(id));
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> list(Pageable pageable) {
        return repo.findAll(pageable).map(this::toRes);
    }

    @Transactional(readOnly = true)
public MemberResponse getWithPermission(Long id, UserPrincipal user) {
    MemberResponse mr = get(id);
    
    // ✅ 디버깅 로그 추가
    System.out.println("========== 권한 체크 시작 ==========");
    System.out.println("요청한 회원 ID: " + id);
    System.out.println("현재 사용자 ID: " + user.getId());
    System.out.println("현재 사용자 이름: " + user.getUsername());
    System.out.println("현재 사용자 Role: " + user.getRole());
    System.out.println("회원의 trainerId: " + mr.trainerId());
    System.out.println("user.isAdmin(): " + user.isAdmin());
    System.out.println("user.isTrainer(): " + user.isTrainer());
    System.out.println("user.getId().equals(id): " + user.getId().equals(id));
    
    if (user.isAdmin()) {
        System.out.println("✅ 관리자 권한으로 접근 허용");
        return mr;
    }
    
    if (user.getId().equals(id)) {
        System.out.println("✅ 본인 정보 접근 허용");
        return mr;
    }
    
    if (user.isTrainer() && mr.trainerId() != null && mr.trainerId().equals(user.getId())) {
        System.out.println("✅ 담당 트레이너 권한으로 접근 허용");
        return mr;
    }
    
    System.out.println("❌ 접근 권한 없음 - AccessDeniedException 발생");
    System.out.println("====================================");
    throw new AccessDeniedException("접근 권한이 없습니다.");
}

    @Transactional(readOnly = true)
    public Page<MemberResponse> listWithPermission(Pageable pageable, UserPrincipal user) {
        if (!user.isAdmin()) {
            throw new AccessDeniedException("관리자만 전체 목록을 조회할 수 있습니다.");
        }
        return list(pageable);
    }

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

    public MemberResponse updateWithPermission(Long id, MemberUpdateRequest req, UserPrincipal user) {
        if (user.isAdmin()) {
            return update(id, req);
        }
        if (user.isTrainer()) {
            return update(id, req);
        }
        if (user.getId().equals(id)) {
            return update(id, req);
        }
        throw new AccessDeniedException("회원 정보를 수정할 권한이 없습니다.");
    }

    public void delete(Long id) {
        repo.delete(find(id));
    }

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
                m.getId(), m.getName(), m.getEmail(), m.getPhone(), m.getRole(), m.getStatus(),
                m.getGender(), calculateAge(m.getDateOfBirth()), m.getAccountStatus(), m.getMembershipType(),
                m.getRegistrationDate(), m.getStartDate(), m.getCreatedAt(), m.getUpdatedAt(),
                m.getTrainer() != null ? m.getTrainer().getId() : null
        );
    }

    public void assignTrainer(Long memberId, Long trainerId) {
        Member member = find(memberId);
        Member trainer = find(trainerId);
        if (!trainer.getRole().isTrainer()) {
            throw new IllegalArgumentException("선택된 회원은 트레이너가 아닙니다.");
        }
        member.setTrainer(trainer);
        repo.save(member);
    }

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

    public void createMembersFromExcel(MultipartFile file, UserPrincipal user) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Member trainer = find(user.getId());
            
            Set<String> excelPhones = new HashSet<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String phone = getCellValue(row.getCell(3));
                if (phone != null && !phone.trim().isEmpty()) {
                    excelPhones.add(phone);
                }
            }
            
            Set<String> existingPhones = new HashSet<>(
                repo.findAll().stream()
                    .map(Member::getPhone)
                    .filter(phone -> phone != null && excelPhones.contains(phone))
                    .toList()
            );
            
            List<Member> newMembers = new ArrayList<>();
            Set<String> processedPhones = new HashSet<>();
            int successCount = 0;
            int skipCount = 0;
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    String name = getCellValue(row.getCell(0));
                    String genderStr = getCellValue(row.getCell(1));
                    String ageStr = getCellValue(row.getCell(2));
                    String phone = getCellValue(row.getCell(3));
                    
                    if (name == null || name.trim().isEmpty() || phone == null || phone.trim().isEmpty()) {
                        skipCount++;
                        continue;
                    }
                    
                    if (processedPhones.contains(phone) || existingPhones.contains(phone)) {
                        skipCount++;
                        continue;
                    }
                    
                    processedPhones.add(phone);
                    
                    Gender gender = parseGender(genderStr);
                    LocalDate dateOfBirth = parseDateOfBirthFromExcel(ageStr);
                    String password = phone.substring(phone.length() - 4);
                    
                    Member newMember = Member.builder()
                            .name(name)
                            .phone(phone)
                            .email(phone + "@gymapp.com")
                            .password(passwordEncoder.encode(password))
                            .gender(gender)
                            .dateOfBirth(dateOfBirth)
                            .role(Role.OT)
                            .status(UserStatus.ACTIVE)
                            .accountStatus(AccountStatus.PENDING)
                            .trainer(trainer)
                            .registrationDate(LocalDate.now())
                            .build();
                    
                    newMembers.add(newMember);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("행 " + (i+1) + " 처리 중 오류: " + e.getMessage());
                    skipCount++;
                }
            }
            
            if (!newMembers.isEmpty()) {
                repo.saveAll(newMembers);
            }
            
            System.out.println("=== Excel 업로드 완료 ===");
            System.out.println("성공: " + successCount + "명");
            System.out.println("건너뜀: " + skipCount + "명");
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        try {
            switch (cell.getCellType()) {
                case STRING: return cell.getStringCellValue().trim();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getDateCellValue().toString();
                    }
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    }
                    return String.valueOf(numericValue);
                case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
                case BLANK: return "";
                default: return "";
            }
        } catch (Exception e) {
            System.err.println("셀 값 읽기 오류: " + e.getMessage());
            return "";
        }
    }

    private Gender parseGender(String genderStr) {
        if (genderStr == null) return null;
        String lower = genderStr.toLowerCase().trim();
        if (lower.equals("남") || lower.equals("남성") || lower.equals("male") || lower.equals("m")) {
            return Gender.MALE;
        } else if (lower.equals("여") || lower.equals("여성") || lower.equals("female") || lower.equals("f")) {
            return Gender.FEMALE;
        }
        return null;
    }

    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate != null) {
            return Period.between(birthDate, LocalDate.now()).getYears();
        }
        return null;
    }
    
    private LocalDate parseDateOfBirthFromExcel(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        Pattern pattern = Pattern.compile("\\((.*?)\\)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String dateStr = matcher.group(1).trim();
            try {
                return LocalDate.parse(dateStr.replace(". ", "-").replace(".", "-"), DateTimeFormatter.ofPattern("yyyy-M-d"));
            } catch (Exception e) {
                System.err.println("날짜 파싱 실패: " + dateStr);
                return null;
            }
        }
        return null;
    }
}