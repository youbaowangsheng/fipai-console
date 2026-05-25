import axios from 'axios';
import { message } from 'antd';

// 燃冰 API 配置
const RANBING_API = import.meta.env.VITE_RANBING_API || 'http://localhost:8002/api';

const ranbingApi = axios.create({
  baseURL: RANBING_API,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 错误处理
const handleError = (error: any, fallbackMsg?: string): string => {
  if (error.response) {
    return error.response.data?.error || error.response.data?.message || fallbackMsg || '请求失败';
  } else if (error.request) {
    return '网络连接失败';
  }
  return error.message || fallbackMsg || '请求失败';
};

// 请求拦截器
ranbingApi.interceptors.request.use(config => {
  const token = localStorage.getItem('console_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
ranbingApi.interceptors.response.use(
  response => response,
  error => {
    message.error(handleError(error));
    return Promise.reject(error);
  }
);

// ============ 用户管理 ============
export const getUsers = (params?: { page?: number; search?: string }) =>
  ranbingApi.get('/users/', { params });
export const getUser = (id: number) => ranbingApi.get(`/users/${id}/`);
export const disableUser = (id: number, disable: boolean = true) =>
  ranbingApi.post(`/users/${id}/disable/`, { disable });
export const getUserSummary = () => ranbingApi.get('/users/summary/');

// ============ 账户管理 ============
export const getAccountProfile = () => ranbingApi.get('/accounts/profile/');
export const updateAccountProfile = (data: any) => ranbingApi.put('/accounts/profile/', data);
export const getAccountUsage = (days?: number) =>
  ranbingApi.get('/accounts/usage/', { params: { days } });
export const getAccountQuota = () => ranbingApi.get('/accounts/quota/');

// ============ Agent 业务配置 ============
export const getBusinessAgents = () => ranbingApi.get('/business/agents/');
export const getBusinessAgent = (id: number) => ranbingApi.get(`/business/agents/${id}/`);
export const createBusinessAgent = (data: {
  agent_name: string;
  agent_type: string;
  description?: string;
  capabilities?: string[];
  config?: any;
}) => ranbingApi.post('/business/agents/', data);
export const updateBusinessAgent = (id: number, data: any) =>
  ranbingApi.patch(`/business/agents/${id}/`, data);
export const deleteBusinessAgent = (id: number) => ranbingApi.delete(`/business/agents/${id}/`);
export const getBusinessAgentTypes = () => ranbingApi.get('/business/agents/types/');
export const getBusinessAgentStats = (id: number) =>
  ranbingApi.get(`/business/agents/${id}/stats/`);

// ============ 运营统计 ============
export const getDashboardStats = () => ranbingApi.get('/stats/dashboard/');
export const getDailyStats = (days?: number) =>
  ranbingApi.get('/stats/daily/', { params: { days } });
export const getUsageReport = (params?: { page?: number; days?: number }) =>
  ranbingApi.get('/stats/usage/', { params });
export const getAgentsRank = () => ranbingApi.get('/stats/agents_rank/');

export default ranbingApi;