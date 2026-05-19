import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://console.fipai.cn/api';
const GW_BASE = import.meta.env.VITE_GW_BASE || 'https://console.fipai.cn/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const gwApi = axios.create({
  baseURL: GW_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器 - 错误处理
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || '请求失败';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// 存储 token
const getToken = () => localStorage.getItem('console_token');
const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
setAuthHeader();

// 统计
export const getStats = () => api.get('/dashboard/stats/');

// 通道
export const getChannels = () => api.get('/channels/channels/');
export const getRouteExplain = (message: string) => api.get(`/channels/route/explain/?message=${encodeURIComponent(message)}`);

// 技能
export const getSkills = () => api.get('/channels/skills/');
export const invokeSkill = (skill_name: string, input: Record<string, any>) =>
  api.post('/channels/skills/invoke/', { skill_name, input });

// 工作流
export const getWorkflows = () => api.get('/channels/workflows/');

// Agent
export const getAgents = () => api.get('/agents/');

// 联系销售
export const getContacts = () => api.get('/contact/');

// 认证
export const login = (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);
  return api.post('/auth/login/', {
    email,
    password,
  });
};
export const logout = () => api.post('/auth/logout/');
export const getUserInfo = () => api.get('/auth/userinfo/');
export const register = (email: string, password: string, name: string) =>
  api.post('/auth/register/', { email, password, name });

// Gateway 接口 (用于 API 测试)
export const gwChat = (message: string, session_id?: string, channel_hint?: string) =>
  gwApi.post('/chat/', {
    message,
    session_id,
    channel_hint: channel_hint !== 'auto' ? channel_hint : undefined,
  });

export const gwHealth = () => gwApi.get('/health/');
export const gwChannels = () => gwApi.get('/channels/');
export const gwSkills = () => gwApi.get('/skills/');
export const gwWorkflows = () => gwApi.get('/workflows/');
export const gwRouteExplain = (message: string) =>
  gwApi.get(`/route/explain/?message=${encodeURIComponent(message)}`);
export const gwChannelChat = (channel: string, message: string, session_id?: string) =>
  gwApi.post(`/channels/${channel}/`, { message, session_id });

export default api;