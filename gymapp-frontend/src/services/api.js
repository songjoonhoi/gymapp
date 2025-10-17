import axios from 'axios';

// apiClient 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:7777/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 현재 활성 사용자 ID 관리
let activeUserId = null;

// 초기화 함수
const initializeActiveUser = () => {
  // sessionStorage 우선, 없으면 localStorage
  const stored = sessionStorage.getItem('activeUserId') || localStorage.getItem('activeUserId');
  if (stored) {
    activeUserId = stored;
  }
  return activeUserId;
};

// 앱 시작 시 초기화
initializeActiveUser();

// ========================
// 🔐 Helper Functions
// ========================

// 현재 활성 사용자 설정
export const setActiveUser = (userId) => {
  activeUserId = String(userId);
  sessionStorage.setItem('activeUserId', activeUserId);
  localStorage.setItem('activeUserId', activeUserId);
  console.log('✅ setActiveUser:', activeUserId);
};

// 인증 데이터 저장 (로그인 시 사용)
export const saveAuthData = (token, user) => {
  const userId = String(user.id || user.memberId);
  
  console.log('=== saveAuthData 호출 ===');
  console.log('user:', user);
  console.log('userId:', userId);
  console.log('token:', token.substring(0, 20) + '...');
  
  // 새로운 방식으로 저장
  localStorage.setItem(`token_${userId}`, token);
  localStorage.setItem(`user_${userId}`, JSON.stringify(user));
  
  // 활성 사용자 설정
  setActiveUser(userId);
  
  console.log('저장 후 localStorage 확인:');
  console.log(`token_${userId}:`, localStorage.getItem(`token_${userId}`) ? '✅ 저장됨' : '❌ 없음');
  console.log(`user_${userId}:`, localStorage.getItem(`user_${userId}`) ? '✅ 저장됨' : '❌ 없음');
  console.log('sessionStorage activeUserId:', sessionStorage.getItem('activeUserId'));
  console.log('localStorage activeUserId:', localStorage.getItem('activeUserId'));
};

// 현재 활성 사용자의 인증 데이터 가져오기
export const getAuthData = () => {
  if (!activeUserId) {
    initializeActiveUser();
  }
  
  if (!activeUserId) {
    console.warn('⚠️ activeUserId가 없습니다');
    return { token: null, user: null };
  }
  
  const token = localStorage.getItem(`token_${activeUserId}`);
  const userStr = localStorage.getItem(`user_${activeUserId}`);
  
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null
  };
};

// 현재 활성 사용자의 인증 데이터 삭제 (로그아웃 시 사용)
export const clearAuthData = () => {
  if (!activeUserId) {
    initializeActiveUser();
  }
  
  if (activeUserId) {
    localStorage.removeItem(`token_${activeUserId}`);
    localStorage.removeItem(`user_${activeUserId}`);
    console.log(`✅ 사용자 ${activeUserId} 데이터 삭제됨`);
  }
  
  // activeUserId 초기화
  sessionStorage.removeItem('activeUserId');
  localStorage.removeItem('activeUserId');
  activeUserId = null;
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

// 🔄 계정 전환 (개발용)
export const switchUser = (userId) => {
  setActiveUser(userId);
  window.location.reload();
};

// 📋 모든 계정 목록 출력 (개발용)
export const showAllUsers = () => {
  const users = getAllStoredUsers();
  const current = sessionStorage.getItem('activeUserId') || localStorage.getItem('activeUserId');
  
  console.table(users.map(u => ({
    ID: u.id || u.memberId,
    이름: u.name || 'N/A',
    역할: u.role,
    활성: String(u.id || u.memberId) === current ? '✅' : ''
  })));
};

// ========================
// 🔧 Interceptors
// ========================

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 로그인/회원가입 요청은 토큰 불필요
    const publicEndpoints = ['/auth/login', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.includes(endpoint)
    );
    
    if (isPublicEndpoint) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔵 API 요청 (인증 불필요)');
      console.log('URL:', config.method.toUpperCase(), config.url);
      console.log('⚠️ Authorization 헤더 제외');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return config;
    }
    
    // 일반 요청은 토큰 추가
    if (!activeUserId) {
      initializeActiveUser();
    }
    
    if (activeUserId) {
      const token = localStorage.getItem(`token_${activeUserId}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Authorization 헤더 추가:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ 토큰이 없습니다. activeUserId:', activeUserId);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API 응답 에러:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.error('🚫 인증 실패 - 로그인 페이지로 이동');
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
export const getDietComments = (logId) => {
  return apiClient.get(`/diet-logs/${logId}/comments`);
};

export const createDietComment = (logId, commentData) => {
  return apiClient.post(`/diet-logs/${logId}/comments`, commentData);
};

export const deleteDietComment = (logId, commentId) => {
  return apiClient.delete(`/diet-logs/${logId}/comments/${commentId}`);
};

// ========================
// 💳 Memberships
// ========================
export const getLatestMembershipSummary = (memberId) => {
  return apiClient.get(`/memberships/member/${memberId}/latest-summary`);
};

export const getMembershipLogs = (memberId) => {
  return apiClient.get(`/memberships/member/${memberId}/logs`);
};

export default apiClient;