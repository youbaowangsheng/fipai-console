import { useState } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Switch, Input, Select,
  Modal, Form, message, Alert
} from 'antd';
import {
  PlusOutlined, ReloadOutlined, DeleteOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface RouteRule {
  id: string;
  name: string;
  pattern: string;
  channel: string;
  priority: number;
  enabled: boolean;
  match_count: number;
  avg_latency: number;
  created_at: string;
}

const channels = [
  { value: 'direct_llm', label: '通道一：快捷问答' },
  { value: 'single_agent', label: '通道二：技能执行' },
  { value: 'multi_agent', label: '通道三：多步编排' },
];

export default function ModuleA() {
  const [rules, setRules] = useState<RouteRule[]>([
    { id: '1', name: '短消息路由', pattern: 'length < 50', channel: 'direct_llm', priority: 1, enabled: true, match_count: 1234, avg_latency: 45, created_at: '2024-05-01' },
    { id: '2', name: '工具调用路由', pattern: 'has_tool_call', channel: 'single_agent', priority: 2, enabled: true, match_count: 856, avg_latency: 120, created_at: '2024-05-05' },
    { id: '3', name: '复杂分析路由', pattern: 'intent = analysis', channel: 'multi_agent', priority: 3, enabled: true, match_count: 234, avg_latency: 890, created_at: '2024-05-10' },
    { id: '4', name: '默认路由', pattern: '*', channel: 'direct_llm', priority: 99, enabled: true, match_count: 5678, avg_latency: 38, created_at: '2024-04-01' },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleToggle = (rule: RouteRule) => {
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
    message.success(`${rule.name} 已${rule.enabled ? '禁用' : '启用'}`);
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    message.success('规则已删除');
  };

  const handleSubmit = (values: any) => {
    const newRule: RouteRule = {
      id: Date.now().toString(),
      ...values,
      enabled: true,
      match_count: 0,
      avg_latency: 0,
      created_at: new Date().toISOString().split('T')[0],
    };
    setRules(prev => [...prev, newRule]);
    message.success('路由规则已创建');
    setModalOpen(false);
  };

  const columns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: RouteRule) => (
        <Switch checked={enabled} onChange={() => handleToggle(record)} />
      ),
    },
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '匹配模式', dataIndex: 'pattern', key: 'pattern', render: (t: string) => <code>{t}</code> },
    {
      title: '目标通道',
      dataIndex: 'channel',
      key: 'channel',
      render: (c: string) => {
        const ch = channels.find(ch => ch.value === c);
        return <Tag color={c === 'direct_llm' ? 'blue' : c === 'single_agent' ? 'green' : 'purple'}>{ch?.label || c}</Tag>;
      },
    },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
    { title: '匹配次数', dataIndex: 'match_count', key: 'match_count', width: 100 },
    { title: '平均延迟', dataIndex: 'avg_latency', key: 'avg_latency', width: 100, render: (v: number) => `${v}ms` },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: RouteRule) => (
        <Space>
          <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Module A - 调度与路由</Title>
          <Text type="secondary">意图识别、注册表、路由策略管理</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建规则</Button>
        </Space>
      </div>

      <Alert
        message="路由规则说明"
        description="路由规则决定请求应该走哪个通道。优先级数字越小越先匹配，使用 * 作为通配符。"
        type="info"
        style={{ marginBottom: 16 }}
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Table dataSource={rules} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Modal title="新建路由规则" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="规则名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="如：短消息路由" />
          </Form.Item>
          <Form.Item label="匹配模式" name="pattern" rules={[{ required: true }]}>
            <Input placeholder="如：length < 50 或 intent = analysis 或 *" />
          </Form.Item>
          <Form.Item label="目标通道" name="channel" rules={[{ required: true }]}>
            <Select placeholder="选择目标通道">
              {channels.map(ch => <Select.Option key={ch.value} value={ch.value}>{ch.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="优先级" name="priority" rules={[{ required: true }]}>
            <Input type="number" placeholder="数字越小优先级越高" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">创建</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}