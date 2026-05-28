import api from './api';

// 系统配置
export const getSystemConfigs = (category?: string) =>
  api.get('/config/system/', { params: category ? { category } : {} });

export const updateSystemConfig = (data: {
  category: string;
  key: string;
  value: any;
  description?: string;
}) => api.post('/config/system/', data);

// Gateway 配置
export const getGatewayConfig = () => api.get('/config/gateway/');

export const updateGatewayConfig = (data: Record<string, any>) =>
  api.put('/config/gateway/', data);

// 通道路由配置
export const getChannelConfig = () => api.get('/config/channel/');

export const updateChannelConfig = (data: {
  channel_weights?: Record<string, number>;
  enabled_channels?: string[];
  routing_rules?: Record<string, any>;
}) => api.put('/config/channel/', data);