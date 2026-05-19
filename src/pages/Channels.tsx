import { useState, useEffect } from 'react';
import { Card, Table, Switch, Button, Space, Tag, message, Modal, Form, Input, Slider, Typography, Alert } from 'antd';
import { ReloadOutlined, EditOutlined, ApiOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getChannels, getRouteExplain } from '../utils/api';

const { Title, Text } = Typography;

interface ChannelConfig {
  name: string;
  enabled: boolean;
  weight: number;
  description: string;
  health: string;
}

const DEFAULT_CHANNELS: ChannelConfig[] = [
  { name: 'direct_llm', enabled: true, weight: 30, description: '直接调用大模型，简单问答', health: 'ok' },
  { name: 'single_agent', enabled: true, weight: 40, description: '单智能体+技能，适合中等复杂度任务', health: 'ok' },
  { name: 'multi_agent', enabled: true, weight: 30, description: '多智能体协同，复杂任务分解', health: 'ok' },
  { name: 'middleware', enabled: false, weight: 0, description: '中间层路由（备用）', health: 'ok' },
];

const PRESETS = [
  { name: '简单问答', channels: { direct_llm: 60, single_agent: 30, multi_agent: 10, middleware: 0 } },
  { name: '智能路由', channels: { direct_llm: 25, single_agent: 50, multi_agent: 25, middleware: 0 } },
  { name: '复杂任务', channels: { direct_llm: 10, single_agent: 30, multi_agent: 60, middleware: 0 } },
  { name: '备用模式', channels: { direct_llm: 0, single_agent: 0, multi_agent: 0, middleware: 100 } },
];

const channelIcons: Record<string, string> = {
  direct_llm: '#1890ff',
  single_agent: '#52c41a',
  multi_agent: '#722ed1',
  middleware: '#faad14',
};

export default function Channels() {
  const [channels, setChannels] = useState<ChannelConfig[]>(DEFAULT_CHANNELS);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(null);
  const [form] = Form.useForm();
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const fetchChannels = () => {
    setLoading(true);
    getChannels().then(res => {
      const serverChannels = res.data.channels || [];
      setChannels(prev => prev.map(ch => {
        const serverCh = serverChannels.find((s: any) => s.name === ch.name);
        return { ...ch, health: serverCh?.health || 'ok' };
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleToggle = (name: string, enabled: boolean) => {
    setChannels(prev => prev.map(ch => {
      if (ch.name === name) {
        const newWeight = enabled ? (ch.weight || 30) : 0;
        return { ...ch, enabled, weight: newWeight };
      }
      return ch;
    }));
    message.success(`已${enabled ? '启用' : '禁用'} ${name}`);
  };

  const handleWeightChange = (name: string, weight: number) => {
    setChannels(prev => prev.map(ch => ch.name === name ? { ...ch, weight } : ch));
  };

  const handleEdit = (channel: ChannelConfig) => {
    setSelectedChannel(channel);
    form.setFieldsValue(channel);
    setEditModalVisible(true);
  };

  const handleSave = () => {
    const values = form.getFieldsValue();
    setChannels(prev => prev.map(ch => ch.name === selectedChannel?.name ? { ...ch, ...values } : ch));
    setEditModalVisible(false);
    message.success('配置已保存');
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setChannels(prev => prev.map(ch => ({
      ...ch,
      weight: preset.channels[ch.name as keyof typeof preset.channels] || 0,
      enabled: preset.channels[ch.name as keyof typeof preset.channels] > 0,
    })));
    message.success(`已应用 "${preset.name}" 策略`);
  };

  const handleTestRoute = () => {
    if (!testMessage.trim()) {
      message.warning('请输入测试消息');
      return;
    }
    setTesting(true);
    getRouteExplain(testMessage).then(res => {
      setTestResult(JSON.stringify(res.data, null, 2));
    }).catch(err => {
      setTestResult('错误: ' + (err.message || '请求失败'));
    }).finally(() => setTesting(false));
  };

  const totalWeight = channels.reduce((sum, ch) => sum + (ch.enabled ? ch.weight : 0), 0);

  const columns = [
    {
      title: '通道',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => (
        <Space>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: channelIcons[name] || '#999' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: ChannelConfig) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggle(record.name, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '权重分配',
      dataIndex: 'weight',
      key: 'weight',
      width: 200,
      render: (weight: number, record: ChannelConfig) => (
        record.enabled ? (
          <Slider
            value={weight}
            min={0}
            max={100}
            onChange={(val) => handleWeightChange(record.name, val)}
            style={{ marginBottom: 0 }}
          />
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
    },
    {
      title: '权重值',
      dataIndex: 'weight',
      key: 'weightValue',
      width: 80,
      render: (weight: number, record: ChannelConfig) => (
        <Tag color={record.enabled ? (weight > 0 ? 'blue' : 'orange') : 'default'}>
          {record.enabled ? `${weight}%` : '禁用'}
        </Tag>
      ),
    },
    {
      title: '健康状态',
      dataIndex: 'health',
      key: 'health',
      width: 90,
      render: (health: string) => (
        health === 'ok' ? (
          <Tag icon={<CheckCircleOutlined />} color="success">健康</Tag>
        ) : (
          <Tag color="error">异常</Tag>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ChannelConfig) => (
        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0, color: '#262626' }}><ApiOutlined /> 通道路由配置</Title>
          <Text type="secondary">配置权重分配，路由算法会根据权重自动选择通道</Text>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchChannels} size="small">刷新</Button>
          <Button type="primary" onClick={() => setTestModalVisible(true)} size="small">测试路由</Button>
        </Space>
      </div>

      {totalWeight !== 100 && (
        <Alert
          message="权重配置警告"
          description={`当前总权重为 ${totalWeight}%，应等于 100% 才能正常工作`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        title="快速策略"
        size="small"
        style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        bordered={false}
      >
        <Space wrap>
          {PRESETS.map(preset => (
            <Button key={preset.name} onClick={() => handleApplyPreset(preset)} size="small">
              {preset.name}
            </Button>
          ))}
        </Space>
      </Card>

      <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
        <Table
          dataSource={channels}
          columns={columns}
          rowKey="name"
          pagination={false}
          loading={loading}
        />
      </Card>

      <Modal
        title={<Space><EditOutlined /> 编辑通道: {selectedChannel?.name}</Space>}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical" initialValues={selectedChannel || undefined}>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="权重" name="weight">
            <Slider min={0} max={100} />
          </Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="测试路由"
        open={testModalVisible}
        onCancel={() => { setTestModalVisible(false); setTestResult(''); setTestMessage(''); }}
        footer={[
          <Button key="close" onClick={() => setTestModalVisible(false)}>关闭</Button>,
          <Button key="test" type="primary" loading={testing} onClick={handleTestRoute}>测试</Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>输入消息:</label>
          <Input.TextArea
            rows={3}
            value={testMessage}
            onChange={e => setTestMessage(e.target.value)}
            placeholder="输入一条消息，查看会被路由到哪个通道..."
            style={{ borderRadius: 8 }}
          />
        </div>
        {testResult && (
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <pre style={{ margin: 0, fontSize: 12 }}>{testResult}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
}