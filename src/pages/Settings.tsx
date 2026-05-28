import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Tag, Space, Tabs, Form, Input, InputNumber, message, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { getChannels, getStats } from '../utils/api';
import { getDashboardStats } from '../utils/ranbingApi';
import { getGatewayConfig, updateGatewayConfig, getChannelConfig, updateChannelConfig } from '../utils/configApi';

export default function Settings() {
  const [testing, setTesting] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'ok' | 'error' | null>(null);
  const [middlewareStatus, setMiddlewareStatus] = useState<'ok' | 'error' | null>(null);
  const [ranbingStatus, setRanbingStatus] = useState<'ok' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [gatewayForm] = Form.useForm();
  const [channelForm] = Form.useForm();
  const [configLoaded, setConfigLoaded] = useState(false);

  // 加载 Gateway 配置
  const loadGatewayConfig = async () => {
    try {
      const res = await getGatewayConfig();
      gatewayForm.setFieldsValue(res.data.gateway_config);
    } catch (err) {
      message.error('加载 Gateway 配置失败');
    }
  };

  // 加载通道路由配置
  const loadChannelConfig = async () => {
    try {
      const res = await getChannelConfig();
      channelForm.setFieldsValue({
        channel1_max_length: res.data.channel1_max_length || 50,
        channel_weights: res.data.channel_weights,
        enabled_channels: res.data.enabled_channels,
      });
    } catch (err) {
      message.error('加载通道路由配置失败');
    }
  };

  useEffect(() => {
    if (!configLoaded) {
      loadGatewayConfig();
      loadChannelConfig();
      setConfigLoaded(true);
    }
  }, [configLoaded]);

  const handleTestGateway = () => {
    setTesting(true);
    fetch('http://120.46.41.158:8000/api/v1/health/')
      .then(() => setGatewayStatus('ok'))
      .catch(() => setGatewayStatus('error'))
      .finally(() => setTesting(false));
  };

  const handleTestMiddleware = () => {
    setTesting(true);
    Promise.all([getChannels(), getStats()])
      .then(() => setMiddlewareStatus('ok'))
      .catch(() => setMiddlewareStatus('error'))
      .finally(() => setTesting(false));
  };

  const handleTestRanbing = () => {
    setTesting(true);
    getDashboardStats()
      .then(() => setRanbingStatus('ok'))
      .catch(() => setRanbingStatus('error'))
      .finally(() => setTesting(false));
  };

  // 保存 Gateway 配置
  const handleSaveGateway = async () => {
    setLoading(true);
    try {
      const values = gatewayForm.getFieldsValue();
      await updateGatewayConfig(values);
      message.success('Gateway 配置已保存，实时生效');
    } catch (err) {
      message.error('保存 Gateway 配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存通道路由配置
  const handleSaveChannel = async () => {
    setLoading(true);
    try {
      const values = channelForm.getFieldsValue();
      await updateChannelConfig({
        channel_weights: values.channel_weights,
        enabled_channels: values.enabled_channels,
        routing_rules: {},
      });
      // 同时更新阈值
      await updateGatewayConfig({ channel1_max_length: values.channel1_max_length });
      message.success('通道路由配置已保存，实时生效');
    } catch (err) {
      message.error('保存通道路由配置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>系统设置</h1>

      <Tabs
        defaultActiveKey="connection"
        items={[
          {
            key: 'connection',
            label: '连接测试',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card title="API 连接测试">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Gateway (8000)">
                      <Space>
                        <Button onClick={handleTestGateway} loading={testing}>
                          测试连接
                        </Button>
                        {gatewayStatus === 'ok' && <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>}
                        {gatewayStatus === 'error' && <Tag color="error" icon={<CloseCircleOutlined />}>异常</Tag>}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Middleware (8001)">
                      <Space>
                        <Button onClick={handleTestMiddleware} loading={testing}>
                          测试连接
                        </Button>
                        {middlewareStatus === 'ok' && <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>}
                        {middlewareStatus === 'error' && <Tag color="error" icon={<CloseCircleOutlined />}>异常</Tag>}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ranbing (8002)">
                      <Space>
                        <Button onClick={handleTestRanbing} loading={testing}>
                          测试连接
                        </Button>
                        {ranbingStatus === 'ok' && <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>}
                        {ranbingStatus === 'error' && <Tag color="error" icon={<CloseCircleOutlined />}>异常</Tag>}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="服务信息">
                  <Descriptions column={2}>
                    <Descriptions.Item label="Gateway">http://120.46.41.158:8000</Descriptions.Item>
                    <Descriptions.Item label="Middleware">http://120.46.41.158:8001</Descriptions.Item>
                    <Descriptions.Item label="Website">https://fipai.cn</Descriptions.Item>
                    <Descriptions.Item label="Console">https://console.fipai.cn</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="环境信息">
                  <Descriptions column={1}>
                    <Descriptions.Item label="API Base">http://120.46.41.158:8001/api</Descriptions.Item>
                    <Descriptions.Item label="Console 版本">1.0.0</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Space>
            ),
          },
          {
            key: 'gateway',
            label: 'Gateway 配置',
            children: (
              <Card>
                <Alert
                  message="配置说明"
                  description="修改 Gateway 配置后无需重启，实时生效。敏感信息如 API Key 会脱敏显示。"
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                <Form form={gatewayForm} layout="vertical">
                  <Form.Item label="OpenAI API Key" name="openai_api_key">
                    <Input.Password placeholder="sk-..." />
                  </Form.Item>
                  <Form.Item label="Base URL" name="openai_base_url">
                    <Input placeholder="https://api.openai.com/v1" />
                  </Form.Item>
                  <Form.Item label="默认模型" name="openai_default_model">
                    <Input placeholder="gpt-4o-mini" />
                  </Form.Item>
                  <Form.Item label="默认 Temperature" name="openai_default_temperature">
                    <InputNumber min={0} max={2} step={0.1} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item label="FIPAI Middleware URL" name="fipai_base_url">
                    <Input placeholder="http://localhost:8001" />
                  </Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSaveGateway}>
                      保存配置
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={loadGatewayConfig}>
                      刷新
                    </Button>
                  </Space>
                </Form>
              </Card>
            ),
          },
          {
            key: 'channel',
            label: '通道路由',
            children: (
              <Card>
                <Alert
                  message="路由配置"
                  description="调整通道路由规则，实时生效。简单消息将走通道一（本地 LLM），复杂消息走通道二三（代理到 Middleware）。"
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                <Form form={channelForm} layout="vertical">
                  <Form.Item label="简单消息阈值 (channel1_max_length)" name="channel1_max_length" extra="超过此长度的消息将路由到 Middleware 处理">
                    <InputNumber min={1} max={500} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item label="通道权重" name="channel_weights" extra="各通道的流量权重分配">
                    <Input.Group compact>
                      <Form.Item name={['channel_weights', 'direct_llm']} noStyle>
                        <InputNumber min={0} max={100} placeholder="direct_llm" style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item name={['channel_weights', 'single_agent']} noStyle>
                        <InputNumber min={0} max={100} placeholder="single_agent" style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item name={['channel_weights', 'multi_agent']} noStyle>
                        <InputNumber min={0} max={100} placeholder="multi_agent" style={{ width: 100 }} />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSaveChannel}>
                      保存路由配置
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={loadChannelConfig}>
                      刷新
                    </Button>
                  </Space>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}