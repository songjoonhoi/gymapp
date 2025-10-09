import axios from 'axios';

// apiClient 대신 api라는 변수명을 사용하셨으므로 그대로 유지합니다.
const apiClient = axios.create({
  baseURL: 'http://localhost:7777/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (JWT 토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉ter (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
// 💬 Diet Comments  [ ✨ 이 부분이 추가됩니다 ✨ ]
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

// ✨ [추가] 특정 회원의 최근 멤버십 정보 조회
export const getLatestMembershipSummary = (memberId) => {
  return apiClient.get(`/memberships/member/${memberId}/latest-summary`);
};

// ✨ [추가] 특정 회원의 전체 멤버십 등록 내역 조회
export const getMembershipLogs = (memberId) => {
  return apiClient.get(`/memberships/member/${memberId}/logs`);
};

export default apiClient;