import axios from 'axios';
import { message } from 'antd';

// API 配置 - 根据环境自动选择
const API_BASE = import.meta.env.VITE_API_BASE || 'https://console.fipai.cn/api';
const GW_BASE = import.meta.env.VITE_GW_BASE || 'https://console.fipai.cn/api/v1';

// 开发模式 - 使用本地后端
const IS_DEV = import.meta.env.DEV;
const LOCAL_API = 'http://localhost:8001/api';
const LOCAL_GW = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: IS_DEV ? LOCAL_API : API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const gwApi = axios.create({
  baseURL: IS_DEV ? LOCAL_GW : GW_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 统一错误处理函数
export const handleApiError = (error: any, fallbackMsg?: string): string => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data?.error || data?.message || '请求参数错误';
      case 401:
        localStorage.removeItem('console_token');
        window.location.href = '/auth';
        return '登录已过期，请重新登录';
      case 403:
        return '没有权限执行此操作';
      case 404:
        return data?.error || data?.message || '请求的资源不存在';
      case 500:
        return '服务器内部错误，请稍后重试';
      default:
        return data?.error || data?.message || fallbackMsg || '请求失败';
    }
  } else if (error.request) {
    return '网络连接失败，请检查网络';
  } else {
    return error.message || fallbackMsg || '请求失败';
  }
};

// 响应拦截器 - 添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('console_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 错误处理
api.interceptors.response.use(
  response => response,
  error => {
    const errorMsg = handleApiError(error);
    message.error(errorMsg);
    return Promise.reject(error);
  }
);

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
export const createWorkflow = (data: { name: string; description?: string; graph_data?: any }) =>
  api.post('/workflows/save/', data);
export const updateWorkflow = (id: number, data: { name?: string; description?: string; graph_data?: any }) =>
  api.put(`/workflows/save/`, { workflow_id: id, ...data });
export const deleteWorkflow = (id: number | string) => api.delete(`/workflows/${id}/`);

// Agent
export const getAgents = () => api.get('/agents/');
export const createAgent = (data: { name: string; agent_type: string; description?: string; capabilities?: string[] }) =>
  api.post('/agents/', data);
export const updateAgent = (id: number, data: { name?: string; agent_type?: string; is_active?: boolean; description?: string }) =>
  api.put(`/agents/${id}/`, data);
export const deleteAgent = (id: number) => api.delete(`/agents/${id}/`);

// 联系销售
export const getContacts = () => api.get('/contact/');

// 认证
export const login = (email: string, password: string) =>
  api.post('/auth/login/', { email, password });
export const logout = () => api.post('/auth/logout/');
export const getUserInfo = () => api.get('/auth/userinfo/');
export const register = (email: string, password: string, name: string) =>
  api.post('/auth/register/', { email, password, name });

// Gateway 接口
export const gwChat = (message: string, session_id?: string, channel_hint?: string) =>
  gwApi.post('/chat/', { message, session_id, channel_hint: channel_hint !== 'auto' ? channel_hint : undefined });
export const gwHealth = () => gwApi.get('/health/');
export const gwChannels = () => gwApi.get('/channels/');
export const gwSkills = () => gwApi.get('/skills/');
export const gwWorkflows = () => gwApi.get('/workflows/');
export const gwRouteExplain = (message: string) =>
  gwApi.get(`/route/explain/?message=${encodeURIComponent(message)}`);
export const gwChannelChat = (channel: string, message: string, session_id?: string) =>
  gwApi.post(`/channels/${channel}/`, { message, session_id });

export default api;