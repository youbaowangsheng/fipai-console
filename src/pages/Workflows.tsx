import { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, Button, Space, Typography } from 'antd';
import { ReloadOutlined, PlusOutlined, EyeOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getWorkflows } from '../utils/api';
import type { Workflow } from '../types';

const { Title } = Typography;

const mockWorkflows: Workflow[] = [
  { workflow_id: 'wf-001', name: '智能客服流程', description: '自动处理客户咨询，智能分配工单', steps: [{ step_id: 1, skill_name: '意图识别' }, { step_id: 2, skill_name: '知识库检索' }, { step_id: 3, skill_name: '生成回复' }] },
  { workflow_id: 'wf-002', name: '数据报告生成', description: '自动采集数据并生成分析报告', steps: [{ step_id: 1, skill_name: '数据采集' }, { step_id: 2, skill_name: '数据分析' }, { step_id: 3, skill_name: '报告生成' }] },
  { workflow_id: 'wf-003', name: '内容审核流程', description: '自动化内容审核与违规处理', steps: [{ step_id: 1, skill_name: '内容检测' }, { step_id: 2, skill_name: '违规标记' }, { step_id: 3, skill_name: '通知处理' }] },
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWorkflows = () => {
    setLoading(true);
    getWorkflows().then(res => {
      setWorkflows(res.data.workflows || mockWorkflows);
    }).catch(() => {
      setWorkflows(mockWorkflows);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'workflow_id', key: 'workflow_id', width: 100 },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => <Space><RocketOutlined style={{ color: '#1890ff' }} />{name}</Space>,
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '步骤',
      dataIndex: 'steps',
      key: 'steps',
      render: (steps: any[]) => (
        <Space size={[4, 4]} wrap>
          {steps?.map((s, i) => (
            <Tag key={i} color="blue">{s.skill_name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Workflow) => (
        <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/workflows/${record.workflow_id}`)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#262626' }}>工作流</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchWorkflows} size="small">刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/workflows/new')} size="small">新建工作流</Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
        ) : (
          <Table
            dataSource={workflows}
            columns={columns}
            rowKey="workflow_id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
          />
        )}
      </Card>
    </div>
  );
}