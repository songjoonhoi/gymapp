import axios from 'axios';

// apiClient 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:7777/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 현재 활성 사용자 ID 관리
let activeUserId = localStorage.getItem('activeUserId') || 'default';

// ========================
// 🔐 Helper Functions
// ========================

// 현재 활성 사용자 설정
export const setActiveUser = (userId) => {
  activeUserId = String(userId);
  localStorage.setItem('activeUserId', activeUserId);
};

// 인증 데이터 저장 (로그인 시 사용)
export const saveAuthData = (token, user) => {
  const userId = String(user.id);
  localStorage.setItem(`token_${userId}`, token);
  localStorage.setItem(`user_${userId}`, JSON.stringify(user));
  setActiveUser(userId);
};

// 현재 활성 사용자의 인증 데이터 가져오기
export const getAuthData = () => {
  const token = localStorage.getItem(`token_${activeUserId}`);
  const userStr = localStorage.getItem(`user_${activeUserId}`);
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null
  };
};

// 현재 활성 사용자의 인증 데이터 삭제 (로그아웃 시 사용)
export const clearAuthData = () => {
  localStorage.removeItem(`token_${activeUserId}`);
  localStorage.removeItem(`user_${activeUserId}`);
  // activeUserId는 유지 (다른 계정으로 전환 가능하도록)
};

// 모든 저장된 계정 목록 가져오기
export const getAllStoredUsers = () => {
  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('user_')) {
      const userStr = localStorage.getItem(key);
      if (userStr) {
        try {
          users.push(JSON.parse(userStr));
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }
    }
  }
  return users;
};

// ========================
// 🔧 Interceptors
// ========================

// 요청 인터셉터 (JWT 토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    // ✅ 현재 활성 사용자의 토큰 사용
    const token = localStorage.getItem(`token_${activeUserId}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ 현재 사용자의 토큰만 삭제
      clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================
// 🧑‍🤝‍🧑 Auth & Member
// ========================
export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const register = (userData) => {
  return apiClient.post('/auth/register', userData);
};

export const getMyProfile = () => {
  return apiClient.get('/members/me');
};


// ========================
// 🍽️ Diet Logs
// ========================
export const getDietLogs = (params) => {
  return apiClient.get('/diet-logs', { params });
};

export const getDietLogDetail = (id) => {
  return apiClient.get(`/diet-logs/${id}`);
};

export const createDietLog = (formData) => {
  return apiClient.post('/diet-logs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateDietLog = (id, formData) => {
  return apiClient.put(`/diet-logs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteDietLog = (id) => {
  return apiClient.delete(`/diet-logs/${id}`);
};


// ========================
// 💬 Diet Comments
// ========================

// 특정 식단일지의 모든 댓글 조회
export const getDietComments = (logId) => {
  return apiClient.get(`/diet-logs/${logId}/comments`);
};

// 식단일지에 댓글 작성
export const createDietComment = (logId, commentData) => {
  return apiClient.post(`/diet-logs/${logId}/comments`, commentData);
};

// 식단일지 댓글 삭제
export const deleteDietComment = (logId, commentId) => {
  return apiClient.delete(`/diet-logs/${logId}/comments/${commentId}`);
};

// ========================
// 💳 Memberships
// ========================

// 특정 회원의 최근 멤버십 정보 조회
export const getLatestMembershipSummary = (memberId) => {
  return apiClient.get(`/memberships/member/${memberId}/latest-summary`);
};

// 특정 회원의 전체 멤버십 등록 내역 조회
export const getMembershipLogs = (memberId) => {
  return apiClient.get(`/memberships/member/${memberId}/logs`);
};

export default apiClient;