import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Progress, Tag } from 'antd';
import {
  SettingOutlined, SyncOutlined, DatabaseOutlined,
  ExperimentOutlined, CommentOutlined, SafetyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ModuleInfo {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  stats: { label: string; value: string | number }[];
  status: 'healthy' | 'warning' | 'error';
}

const modules: ModuleInfo[] = [
  {
    key: 'module-a',
    name: '调度与路由',
    icon: <SyncOutlined style={{ fontSize: 24 }} />,
    color: '#1890ff',
    desc: '意图识别、注册表、路由策略',
    stats: [
      { label: '活跃规则', value: 12 },
      { label: '路由成功率', value: '99.2%' },
      { label: '平均延迟', value: '45ms' },
    ],
    status: 'healthy',
  },
  {
    key: 'module-b',
    name: '记忆与上下文',
    icon: <DatabaseOutlined style={{ fontSize: 24 }} />,
    color: '#52c41a',
    desc: '短期/长期/Profile三层记忆',
    stats: [
      { label: '短期记忆', value: '1.2GB' },
      { label: '长期记忆', value: '8.5GB' },
      { label: '上下文命中率', value: '94%' },
    ],
    status: 'healthy',
  },
  {
    key: 'module-c',
    name: '协作编排',
    icon: <SettingOutlined style={{ fontSize: 24 }} />,
    color: '#722ed1',
    desc: '顺序/并行/条件分支/混合模式',
    stats: [
      { label: '运行中工作流', value: 8 },
      { label: '今日执行', value: 1342 },
      { label: '成功率', value: '97.8%' },
    ],
    status: 'healthy',
  },
  {
    key: 'module-d',
    name: '版本管理',
    icon: <ExperimentOutlined style={{ fontSize: 24 }} />,
    color: '#faad14',
    desc: '测试、A/B、灰度、回滚',
    stats: [
      { label: '活跃版本', value: 5 },
      { label: '灰度中', value: 2 },
      { label: '回滚次数', value: 3 },
    ],
    status: 'warning',
  },
  {
    key: 'module-e',
    name: '反馈优化',
    icon: <CommentOutlined style={{ fontSize: 24 }} />,
    color: '#f5222d',
    desc: '正向强化、负向分析、周报',
    stats: [
      { label: '本周反馈', value: 856 },
      { label: '优化建议', value: 23 },
      { label: '自动优化率', value: '67%' },
    ],
    status: 'healthy',
  },
  {
    key: 'module-f',
    name: '权限与预算',
    icon: <SafetyOutlined style={{ fontSize: 24 }} />,
    color: '#eb2f96',
    desc: '预算管控、权限矩阵、审计日志',
    stats: [
      { label: '预算使用', value: '78%' },
      { label: '在线用户', value: 156 },
      { label: '今日审计', value: 2340 },
    ],
    status: 'healthy',
  },
];

export default function RuntimeOverview() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, background: "#f0f2f5" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>运行时管理 - 总览</Title>
        <Text type="secondary">核心运行时层模块监控与配置</Text>
      </div>

      <Row gutter={[16, 16]}>
        {modules.map(mod => (
          <Col span={8} key={mod.key}>
            <Card
              hoverable
              style={{ borderRadius: 12, cursor: 'pointer' }}
              onClick={() => navigate(`/runtime/${mod.key}`)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: `${mod.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: mod.color,
                  }}
                >
                  {mod.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 16 }}>{mod.name}</Text>
                    <Tag color={mod.status === 'healthy' ? 'success' : mod.status === 'warning' ? 'warning' : 'error'}>
                      {mod.status === 'healthy' ? '正常' : mod.status === 'warning' ? '警告' : '异常'}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{mod.desc}</Text>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Row gutter={16}>
                  {mod.stats.map((stat, i) => (
                    <Col span={8} key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: mod.color }}>{stat.value}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{stat.label}</div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 系统状态总览 */}
      <Card title="系统健康状态" style={{ marginTop: 24 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={98} size={80} strokeColor="#52c41a" />
              <div style={{ marginTop: 8 }}>整体可用性</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={95} size={80} strokeColor="#1890ff" />
              <div style={{ marginTop: 8 }}>路由成功率</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={92} size={80} strokeColor="#faad14" />
              <div style={{ marginTop: 8 }}>编排成功率</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress type="circle" percent={78} size={80} strokeColor="#f5222d" />
              <div style={{ marginTop: 8 }}>预算使用</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}