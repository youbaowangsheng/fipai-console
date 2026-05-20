import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Badge, Empty, Skeleton, Input, Modal, message } from 'antd';
import { ReloadOutlined, PlusOutlined, EyeOutlined, EditOutlined, RobotOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAgents, deleteAgent } from '../utils/api';
import type { Agent } from '../types';

const { Title } = Typography;

const mockAgents: Agent[] = [
  { id: 1, name: '人脉推荐Agent', agent_type: 'recommendation', status: 'active', is_active: true, capabilities: ['用户分析', '人脉匹配', '智能推荐'] },
  { id: 2, name: '客服Agent', agent_type: 'customer_service', status: 'active', is_active: true, capabilities: ['自动回复', '问题分类', '满意度分析'] },
  { id: 3, name: '数据分析Agent', agent_type: 'analytics', status: 'active', is_active: true, capabilities: ['数据清洗', '趋势分析', '报表生成'] },
  { id: 4, name: '内容审核Agent', agent_type: 'moderation', status: 'inactive', is_active: false, capabilities: ['内容检测', '违规标记', '自动拦截'] },
  { id: 5, name: '日程管理Agent', agent_type: 'productivity', status: 'active', is_active: true, capabilities: ['日历同步', '会议安排', '提醒推送'] },
];

const typeColors: Record<string, string> = {
  recommendation: 'purple',
  customer_service: 'blue',
  analytics: 'cyan',
  moderation: 'orange',
  productivity: 'green',
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchAgents = () => {
    setLoading(true);
    getAgents().then(res => {
      const agentsData = res.data?.agents ?? res.data ?? mockAgents;
      setAgents(Array.isArray(agentsData) ? agentsData : mockAgents);
    }).catch(() => {
      setAgents(mockAgents);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个 Agent 吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setDeleteLoading(id);
        try {
          await deleteAgent(id);
          setAgents(prev => prev.filter(a => a.id !== id));
          message.success('删除成功');
        } catch {
          // Error handled by API interceptor
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
    agent.agent_type.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => <Space><RobotOutlined style={{ color: '#1890ff' }} />{name}</Space>,
    },
    {
      title: '类型',
      dataIndex: 'agent_type',
      key: 'agent_type',
      width: 110,
      render: (t: string) => <Tag color={typeColors[t] || 'default'}>{t}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Badge status={s === 'active' ? 'success' : 'default'} text={s === 'active' ? '运行中' : '已停止'} />,
    },
    {
      title: '激活',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 60,
      render: (v: boolean) => v ? <Tag color="blue">是</Tag> : <Tag color="red">否</Tag>,
    },
    {
      title: '能力',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (arr: string[]) => (
        <Space size={[4, 4]} wrap>
          {arr?.map((c, i) => <Tag key={i} style={{ marginRight: 0 }}>{c}</Tag>)}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Agent) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => navigate(`/agents/${record.id}`)}>详情</Button>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => navigate(`/agents/${record.id}/edit`)}>编辑</Button>
          <Button size="small" type="text" danger icon={<DeleteOutlined />} loading={deleteLoading === record.id} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fffaf5" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#262626' }}>Agent 管理</Title>
        <Space>
          <Input placeholder="搜索名称/类型" value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 180 }} allowClear size="small" />
          <Button icon={<ReloadOutlined />} onClick={fetchAgents} size="small">刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/agents/new')} size="small">新建 Agent</Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
        {loading ? (
          <Card style={{ borderRadius: 8 }}><Skeleton active paragraph={{ rows: 8 }} /></Card>
        ) : (
          <Table
            dataSource={filteredAgents}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
            locale={{ emptyText: <Empty description="暂无 Agent 数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        )}
      </Card>
    </div>
  );
}