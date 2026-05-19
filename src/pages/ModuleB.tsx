import { useState } from 'react';
import { Card, Table, Tag, Button, Typography, Switch, Progress, Row, Col, Statistic } from 'antd';
import { DatabaseOutlined, ClockCircleOutlined, UserOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface MemoryEntry {
  id: string;
  type: 'short_term' | 'long_term' | 'profile';
  key: string;
  size: string;
  entries: number;
  last_access: string;
  hit_rate: number;
  enabled: boolean;
}

export default function ModuleB() {
  const [memories, setMemories] = useState<MemoryEntry[]>([
    { id: '1', type: 'short_term', key: 'session', size: '256MB', entries: 1247, last_access: '2024-05-20 10:30:00', hit_rate: 94, enabled: true },
    { id: '2', type: 'short_term', key: 'context', size: '512MB', entries: 856, last_access: '2024-05-20 10:29:45', hit_rate: 89, enabled: true },
    { id: '3', type: 'long_term', key: 'user_history', size: '2.5GB', entries: 15678, last_access: '2024-05-20 10:28:00', hit_rate: 76, enabled: true },
    { id: '4', type: 'long_term', key: 'knowledge_base', size: '4.2GB', entries: 8934, last_access: '2024-05-20 10:25:00', hit_rate: 82, enabled: true },
    { id: '5', type: 'profile', key: 'user_profile', size: '128MB', entries: 2341, last_access: '2024-05-20 10:30:00', hit_rate: 97, enabled: true },
    { id: '6', type: 'profile', key: 'preference', size: '64MB', entries: 1892, last_access: '2024-05-20 10:29:30', hit_rate: 91, enabled: false },
  ]);

  const handleToggle = (entry: MemoryEntry) => {
    setMemories(prev => prev.map(m => m.id === entry.id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleClear = (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, entries: 0 } : m));
  };

  const typeMap = {
    short_term: { label: '短期记忆', color: 'blue', icon: <ClockCircleOutlined /> },
    long_term: { label: '长期记忆', color: 'green', icon: <DatabaseOutlined /> },
    profile: { label: 'Profile', color: 'purple', icon: <UserOutlined /> },
  };

  const columns = [
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: MemoryEntry) => (
        <Switch checked={enabled} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: keyof typeof typeMap) => {
        const t = typeMap[type];
        return <Tag icon={t.icon} color={t.color}>{t.label}</Tag>;
      },
    },
    { title: '键', dataIndex: 'key', key: 'key', render: (t: string) => <code>{t}</code> },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100 },
    { title: '条目数', dataIndex: 'entries', key: 'entries', width: 100 },
    { title: '命中率', dataIndex: 'hit_rate', key: 'hit_rate', width: 150,
      render: (rate: number) => <Progress percent={rate} size="small" status={rate > 90 ? 'success' : 'normal'} /> },
    { title: '最后访问', dataIndex: 'last_access', key: 'last_access', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: MemoryEntry) => (
        <Button size="small" type="link" danger icon={<ClearOutlined />} onClick={() => handleClear(record.id)}>
          清空
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fffaf5" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Module B - 记忆与上下文</Title>
          <Text type="secondary">短期/长期/Profile三层记忆管理</Text>
        </div>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="短期记忆" value="768MB" prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="长期记忆" value="6.7GB" prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Profile" value="192MB" prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均命中率" value="88%" />
          </Card>
        </Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Table dataSource={memories} columns={columns} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}