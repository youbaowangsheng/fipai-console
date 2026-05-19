import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, Space, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

const mockAgentDetail: Record<number, AgentDetail> = {
  1: { id: 1, name: '人脉推荐Agent', agent_type: 'recommendation', status: 'active', is_active: true, capabilities: ['用户分析', '人脉匹配', '智能推荐'], description: '基于用户画像和行为分析，智能推荐相关人脉', created_at: '2026-05-01 10:00:00', updated_at: '2026-05-15 14:30:00' },
  2: { id: 2, name: '客服Agent', agent_type: 'customer_service', status: 'active', is_active: true, capabilities: ['自动回复', '问题分类', '满意度分析'], description: '提供7x24小时智能客服服务，自动处理常见问题', created_at: '2026-05-02 09:00:00', updated_at: '2026-05-15 16:00:00' },
  3: { id: 3, name: '数据分析Agent', agent_type: 'analytics', status: 'active', is_active: true, capabilities: ['数据清洗', '趋势分析', '报表生成'], description: '自动化数据分析，快速生成业务报表', created_at: '2026-05-03 11:00:00', updated_at: '2026-05-14 10:00:00' },
};

interface AgentDetail {
  id: number;
  name: string;
  agent_type: string;
  status: string;
  is_active: boolean;
  capabilities: string[];
  description: string;
  created_at: string;
  updated_at: string;
}

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = mockAgentDetail[Number(id)] || mockAgentDetail[1];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/agents')}>
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>Agent 详情</Title>
        </Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/agents/${id}/edit`)}>
          编辑
        </Button>
      </div>

      <Card>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{agent.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{agent.name}</Descriptions.Item>
          <Descriptions.Item label="类型"><Tag color="blue">{agent.agent_type}</Tag></Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={agent.status === 'active' ? 'green' : 'default'}>{agent.status === 'active' ? '运行中' : '已停止'}</Tag></Descriptions.Item>
          <Descriptions.Item label="激活"><Tag color={agent.is_active ? 'blue' : 'red'}>{agent.is_active ? '是' : '否'}</Tag></Descriptions.Item>
          <Descriptions.Item label="创建时间">{agent.created_at}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{agent.description}</Descriptions.Item>
          <Descriptions.Item label="能力" span={2}>
            {agent.capabilities.map((c, i) => <Tag key={i} style={{ marginRight: 4 }}>{c}</Tag>)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">{agent.updated_at}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}