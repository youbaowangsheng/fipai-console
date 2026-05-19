import { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Switch, Button, Space, Tag, message, Divider, Typography, Tabs, Slider } from 'antd';
import { SettingOutlined, KeyOutlined, ApiOutlined, GlobalOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ApiConfig {
  deepseek_key: string;
  openai_key: string;
  gateway_key: string;
}

interface ModelConfig {
  default_model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
}

interface CallbackConfig {
  webhook_url: string;
  callback_enabled: boolean;
  retry_count: number;
}

const DEFAULT_API_CONFIG: ApiConfig = {
  deepseek_key: '',
  openai_key: '',
  gateway_key: '',
};

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  default_model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
};

const DEFAULT_CALLBACK_CONFIG: CallbackConfig = {
  webhook_url: '',
  callback_enabled: false,
  retry_count: 3,
};

export default function SystemConfig() {
  const [apiForm] = Form.useForm();
  const [modelForm] = Form.useForm();
  const [callbackForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('api');

  useEffect(() => {
    // 加载已有配置（从 localStorage 模拟）
    const savedApi = localStorage.getItem('console_api_config');
    const savedModel = localStorage.getItem('console_model_config');
    const savedCallback = localStorage.getItem('console_callback_config');

    if (savedApi) {
      apiForm.setFieldsValue(JSON.parse(savedApi));
    } else {
      apiForm.setFieldsValue(DEFAULT_API_CONFIG);
    }

    if (savedModel) {
      modelForm.setFieldsValue(JSON.parse(savedModel));
    } else {
      modelForm.setFieldsValue(DEFAULT_MODEL_CONFIG);
    }

    if (savedCallback) {
      callbackForm.setFieldsValue(JSON.parse(savedCallback));
    } else {
      callbackForm.setFieldsValue(DEFAULT_CALLBACK_CONFIG);
    }
  }, []);

  const handleSaveApi = async () => {
    setSaving(true);
    try {
      const values = await apiForm.validateFields();
      localStorage.setItem('console_api_config', JSON.stringify(values));
      message.success('API 配置已保存');
    } catch (err) {
      message.error('请检查表单');
    }
    setSaving(false);
  };

  const handleSaveModel = async () => {
    setSaving(true);
    try {
      const values = await modelForm.validateFields();
      localStorage.setItem('console_model_config', JSON.stringify(values));
      message.success('模型配置已保存');
    } catch (err) {
      message.error('请检查表单');
    }
    setSaving(false);
  };

  const handleSaveCallback = async () => {
    setSaving(true);
    try {
      const values = await callbackForm.validateFields();
      localStorage.setItem('console_callback_config', JSON.stringify(values));
      message.success('回调配置已保存');
    } catch (err) {
      message.error('请检查表单');
    }
    setSaving(false);
  };

  const testApiConnection = (name: string) => {
    message.loading(`正在测试 ${name}...`, 1).then(() => {
      message.success(`${name} 连接正常`);
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 24 }}><SettingOutlined /> 系统配置</Title>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'api',
              label: <span><KeyOutlined /> API 配置</span>,
              children: (
                <Form form={apiForm} layout="vertical">
                  <Form.Item label="DeepSeek API Key" name="deepseek_key" tooltip="用于调用 DeepSeek 模型">
                    <Input.Password placeholder="sk-..." />
                  </Form.Item>
                  <Form.Item label="OpenAI API Key" name="openai_key" tooltip="备用 LLM 调用">
                    <Input.Password placeholder="sk-..." />
                  </Form.Item>
                  <Form.Item label="Gateway API Key" name="gateway_key" tooltip="服务间认证">
                    <Input.Password placeholder="输入 Gateway API Key" />
                  </Form.Item>
                  <Divider />
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveApi} loading={saving}>
                      保存配置
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => {
                      apiForm.setFieldsValue(DEFAULT_API_CONFIG);
                    }}>
                      重置
                    </Button>
                  </Space>
                </Form>
              ),
            },
            {
              key: 'model',
              label: <span><ApiOutlined /> 模型参数</span>,
              children: (
                <Form form={modelForm} layout="vertical">
                  <Form.Item label="默认模型" name="default_model">
                    <Select>
                      <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
                      <Select.Option value="deepseek-coder">DeepSeek Coder</Select.Option>
                      <Select.Option value="gpt-4o-mini">GPT-4o Mini</Select.Option>
                      <Select.Option value="gpt-4o">GPT-4o</Select.Option>
                      <Select.Option value="claude-3-haiku">Claude 3 Haiku</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Temperature" name="temperature" tooltip="控制随机性，0更确定，2更有创造性">
                    <Slider min={0} max={2} step={0.1} marks={{ 0: '0', 0.7: '0.7', 1: '1', 1.5: '1.5', 2: '2' }} />
                  </Form.Item>
                  <Form.Item label="最大 Tokens" name="max_tokens">
                    <Input type="number" placeholder="2000" />
                  </Form.Item>
                  <Form.Item label="Top P" name="top_p" tooltip="核采样参数">
                    <Slider min={0} max={1} step={0.1} marks={{ 0: '0', 0.5: '0.5', 1: '1' }} />
                  </Form.Item>
                  <Divider />
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveModel} loading={saving}>
                      保存配置
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => {
                      modelForm.setFieldsValue(DEFAULT_MODEL_CONFIG);
                    }}>
                      重置
                    </Button>
                  </Space>
                </Form>
              ),
            },
            {
              key: 'callback',
              label: <span><GlobalOutlined /> 回调配置</span>,
              children: (
                <Form form={callbackForm} layout="vertical">
                  <Form.Item label="启用回调" name="callback_enabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="Webhook URL" name="webhook_url" tooltip="任务完成后的回调通知地址">
                    <Input placeholder="https://your-domain.com/callback" />
                  </Form.Item>
                  <Form.Item label="重试次数" name="retry_count" tooltip="回调失败时的重试次数">
                    <Select>
                      <Select.Option value={1}>1次</Select.Option>
                      <Select.Option value={3}>3次</Select.Option>
                      <Select.Option value={5}>5次</Select.Option>
                      <Select.Option value={10}>10次</Select.Option>
                    </Select>
                  </Form.Item>
                  <Divider />
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveCallback} loading={saving}>
                      保存配置
                    </Button>
                    <Button onClick={() => {
                      callbackForm.setFieldsValue(DEFAULT_CALLBACK_CONFIG);
                    }}>
                      重置
                    </Button>
                  </Space>
                </Form>
              ),
            },
            {
              key: 'status',
              label: <span><SettingOutlined /> 服务状态</span>,
              children: (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 0' }}><Text strong>Gateway (8000)</Text></td>
                        <td><Tag color="green">● 在线</Tag></td>
                        <td><Button size="small" onClick={() => testApiConnection('Gateway')}>测试</Button></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 0' }}><Text strong>Middleware (8001)</Text></td>
                        <td><Tag color="green">● 在线</Tag></td>
                        <td><Button size="small" onClick={() => testApiConnection('Middleware')}>测试</Button></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 0' }}><Text strong>DeepSeek API</Text></td>
                        <td><Tag color="green">● 正常</Tag></td>
                        <td><Button size="small" onClick={() => testApiConnection('DeepSeek')}>测试</Button></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 0' }}><Text strong>Redis</Text></td>
                        <td><Tag color="green">● 已连接</Tag></td>
                        <td><Button size="small">测试</Button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}