import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Timeline, Row, Col, Statistic, Modal, message } from 'antd';
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Version {
  id: string;
  name: string;
  agent_id: string;
  agent_name: string;
  version: string;
  status: 'active' | 'testing' | 'ab' | 'gray' | 'rollback';
  traffic: number;
  created_at: string;
  changelog: string;
}

export default function ModuleD() {
  const [versions, setVersions] = useState<Version[]>([
    { id: '1', name: '早报助手 v2.1', agent_id: '1', agent_name: '早报助手', version: '2.1.0', status: 'active', traffic: 100, created_at: '2024-05-15', changelog: '优化摘要生成逻辑' },
    { id: '2', name: '早报助手 v2.2', agent_id: '1', agent_name: '早报助手', version: '2.2.0', status: 'gray', traffic: 20, created_at: '2024-05-18', changelog: '新增突发事件提醒' },
    { id: '3', name: '早报助手 v2.3', agent_id: '1', agent_name: '早报助手', version: '2.3.0-beta', status: 'testing', traffic: 0, created_at: '2024-05-20', changelog: 'A/B测试新算法' },
    { id: '4', name: '匹配助手 v1.5', agent_id: '2', agent_name: '匹配助手', version: '1.5.0', status: 'active', traffic: 100, created_at: '2024-05-10', changelog: '修复匹配精度问题' },
    { id: '5', name: '匹配助手 v1.6', agent_id: '2', agent_name: '匹配助手', version: '1.6.0', status: 'ab', traffic: 50, created_at: '2024-05-19', changelog: 'A/B测试新匹配算法' },
    { id: '6', name: '欢迎助手 v1.2', agent_id: '3', agent_name: '欢迎助手', version: '1.2.0', status: 'rollback', traffic: 0, created_at: '2024-05-05', changelog: '回滚到v1.1 - 发现严重bug' },
  ]);

  const statusMap = {
    active: { label: '线上', color: 'success' },
    testing: { label: '测试中', color: 'processing' },
    ab: { label: 'A/B测试', color: 'warning' },
    gray: { label: '灰度发布', color: 'purple' },
    rollback: { label: '已回滚', color: 'error' },
  };

  const handleToggleTraffic = (version: Version) => {
    if (version.status !== 'active' && version.status !== 'gray') {
      message.warning('只有线上或灰度版本可以调整流量');
      return;
    }
    setVersions(prev => prev.map(v =>
      v.id === version.id
        ? { ...v, traffic: v.traffic === 100 ? 20 : 100, status: v.traffic === 100 ? 'gray' : 'active' }
        : v
    ));
    message.success(`流量已调整为${version.traffic === 100 ? 20 : 100}%`);
  };

  const handleRollback = (version: Version) => {
    Modal.confirm({
      title: '确认回滚',
      content: `确定要回滚到 ${version.version} 版本吗？`,
      onOk: () => {
        setVersions(prev => prev.map(v =>
          v.agent_id === version.agent_id
            ? { ...v, status: v.id === version.id ? 'active' : v.status === 'active' ? 'rollback' : v.status, traffic: v.id === version.id ? 100 : 0 }
            : v
        ));
        message.success('回滚成功');
      },
    });
  };

  const columns = [
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: keyof typeof statusMap) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
    { title: '版本名称', dataIndex: 'name', key: 'name' },
    { title: '版本号', dataIndex: 'version', key: 'version', render: (v: string) => <code>{v}</code> },
    { title: 'Agent', dataIndex: 'agent_name', key: 'agent_name' },
    { title: '流量', dataIndex: 'traffic', key: 'traffic', width: 100, render: (t: number) => `${t}%` },
    { title: '更新时间', dataIndex: 'created_at', key: 'created_at', width: 120 },
    { title: '变更日志', dataIndex: 'changelog', key: 'changelog', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Version) => (
        <Space>
          {(record.status === 'active' || record.status === 'gray') && (
            <Button size="small" type="link" onClick={() => handleToggleTraffic(record)}>
              {record.traffic === 100 ? '切灰度' : '切全量'}
            </Button>
          )}
          {record.status !== 'rollback' && (
            <Button size="small" type="link" danger icon={<RollbackOutlined />} onClick={() => handleRollback(record)}>
              回滚
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Module D - 版本管理</Title>
          <Text type="secondary">测试、A/B、灰度、回滚管理</Text>
        </div>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="线上版本" value={versions.filter(v => v.status === 'active').length} /></Card></Col>
        <Col span={6}><Card><Statistic title="测试中" value={versions.filter(v => v.status === 'testing').length} /></Card></Col>
        <Col span={6}><Card><Statistic title="A/B测试" value={versions.filter(v => v.status === 'ab').length} /></Card></Col>
        <Col span={6}><Card><Statistic title="灰度发布" value={versions.filter(v => v.status === 'gray').length} /></Card></Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Table dataSource={versions} columns={columns} rowKey="id" pagination={false} />
      </Card>

      {/* 版本发布时间线 */}
      <Card title="版本发布历史" style={{ marginTop: 16 }}>
        <Timeline
          items={[
            { color: 'green', children: 'v2.1.0 发布 (2024-05-15)' },
            { color: 'blue', children: 'v2.2.0 灰度20% (2024-05-18)' },
            { color: 'blue', children: 'v2.3.0-beta 进入测试 (2024-05-20)' },
            { color: 'red', children: 'v1.2.0 回滚 (2024-05-05)' },
          ]}
        />
      </Card>
    </div>
  );
}