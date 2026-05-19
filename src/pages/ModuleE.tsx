import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, Progress, Modal, Tabs } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, BulbOutlined, BarChartOutlined, CommentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Feedback {
  id: string;
  type: 'positive' | 'negative';
  agent_id: string;
  agent_name: string;
  content: string;
  score: number;
  source: string;
  created_at: string;
  auto_optimized: boolean;
}

interface Optimization {
  id: string;
  prompt: string;
  improvement: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  created_at: string;
}

export default function ModuleE() {
  const [feedback] = useState<Feedback[]>([
    { id: '1', type: 'positive', agent_id: '1', agent_name: '早报助手', content: '推荐很准确，符合我的需求', score: 5, source: 'explicit', created_at: '2024-05-20 10:30:00', auto_optimized: true },
    { id: '2', type: 'negative', agent_id: '1', agent_name: '早报助手', content: '推荐的岗位太旧了', score: 2, source: 'implicit', created_at: '2024-05-20 09:15:00', auto_optimized: false },
    { id: '3', type: 'positive', agent_id: '2', agent_name: '匹配助手', content: '匹配速度很快', score: 5, source: 'explicit', created_at: '2024-05-19 18:00:00', auto_optimized: true },
    { id: '4', type: 'negative', agent_id: '2', agent_name: '匹配助手', content: '匹配结果不够精准', score: 1, source: 'implicit', created_at: '2024-05-19 15:30:00', auto_optimized: false },
  ]);

  const [optimizations] = useState<Optimization[]>([
    { id: '1', prompt: '请增加"最近3天发布"的过滤条件', improvement: '提升结果时效性', status: 'applied', created_at: '2024-05-18' },
    { id: '2', prompt: '在匹配前增加行业验证', improvement: '减少跨行业错误匹配', status: 'approved', created_at: '2024-05-17' },
    { id: '3', prompt: '优化输出格式，增加置信度', improvement: '便于用户筛选', status: 'pending', created_at: '2024-05-20' },
  ]);

  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);

  const statusMap = {
    pending: { label: '待处理', color: 'default' },
    approved: { label: '已批准', color: 'processing' },
    rejected: { label: '已拒绝', color: 'error' },
    applied: { label: '已应用', color: 'success' },
  };

  const feedbackColumns = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, render: (t: 'positive' | 'negative') => <Tag color={t === 'positive' ? 'success' : 'error'} icon={t === 'positive' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>{t === 'positive' ? '正向' : '负向'}</Tag> },
    { title: 'Agent', dataIndex: 'agent_name', key: 'agent_name' },
    { title: '反馈内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '评分', dataIndex: 'score', key: 'score', width: 80, render: (s: number) => <Progress steps={5} percent={s * 20} size="small" /> },
    { title: '来源', dataIndex: 'source', key: 'source', width: 80, render: (s: string) => s === 'explicit' ? '显式' : '隐式' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 160 },
    { title: '自动优化', dataIndex: 'auto_optimized', key: 'auto_optimized', width: 100, render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag> },
  ];

  const optColumns = [
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: keyof typeof statusMap) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
    { title: '优化建议', dataIndex: 'prompt', key: 'prompt', ellipsis: true },
    { title: '改进内容', dataIndex: 'improvement', key: 'improvement' },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 120 },
  ];

  const positiveCount = feedback.filter(f => f.type === 'positive').length;
  const negativeCount = feedback.filter(f => f.type === 'negative').length;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Module E - 反馈优化</Title>
          <Text type="secondary">正向强化、负向分析、周报生成</Text>
        </div>
        <Space>
          <Button icon={<BarChartOutlined />} onClick={() => setWeeklyReportOpen(true)}>生成周报</Button>
          <Button icon={<ReloadOutlined />}>刷新</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="本周反馈" value={feedback.length} prefix={<CommentOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="正向反馈" value={positiveCount} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="负向反馈" value={negativeCount} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="自动优化率" value={`${Math.round((feedback.filter(f => f.auto_optimized).length / feedback.length) * 100)}%`} suffix={<BulbOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="feedback" items={[
        {
          key: 'feedback',
          label: <span><CommentOutlined /> 反馈列表</span>,
          children: (
            <Card styles={{ body: { padding: 0 } }}>
              <Table dataSource={feedback} columns={feedbackColumns} rowKey="id" pagination={false} />
            </Card>
          ),
        },
        {
          key: 'optimization',
          label: <span><BulbOutlined /> 优化建议</span>,
          children: (
            <Card styles={{ body: { padding: 0 } }}>
              <Table dataSource={optimizations} columns={optColumns} rowKey="id" pagination={false} />
            </Card>
          ),
        },
      ]} />

      <Modal title="周报生成" open={weeklyReportOpen} onCancel={() => setWeeklyReportOpen(false)} footer={null} width={600}>
        <Card size="small">
          <Title level={5}>FIPAI 周报 - 2024.05.13 ~ 2024.05.20</Title>
          <div style={{ marginTop: 16 }}>
            <Text strong>一、反馈统计</Text>
            <ul>
              <li>总反馈数：{feedback.length}</li>
              <li>正向反馈：{positiveCount} ({Math.round(positiveCount / feedback.length * 100)}%)</li>
              <li>负向反馈：{negativeCount} ({Math.round(negativeCount / feedback.length * 100)}%)</li>
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Text strong>二、优化进展</Text>
            <ul>
              <li>已应用优化：{optimizations.filter(o => o.status === 'applied').length} 项</li>
              <li>待批准：{optimizations.filter(o => o.status === 'pending').length} 项</li>
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Text strong>三、建议</Text>
            <p>1. 早报助手的岗位推荐应增加发布时间过滤<br/>2. 匹配助手可引入置信度阈值过滤低质量结果</p>
          </div>
        </Card>
      </Modal>
    </div>
  );
}