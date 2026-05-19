import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, Progress } from 'antd';
import { SafetyOutlined, DollarOutlined, UserOutlined, AuditOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Budget {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  total: number;
  used: number;
  remaining: number;
  alert_threshold: number;
  period: string;
}

interface Permission {
  id: string;
  user: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  agents: string[];
  permissions: string[];
  last_login: string;
}

interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  target: string;
  result: 'success' | 'failed';
  ip: string;
}

export default function ModuleF() {
  const [budgets] = useState<Budget[]>([
    { id: '1', name: 'DeepSeek V3', type: 'monthly', total: 10000, used: 7832, remaining: 2168, alert_threshold: 80, period: '2024-05' },
    { id: '2', name: 'GPT-4o Mini', type: 'monthly', total: 5000, used: 4567, remaining: 433, alert_threshold: 80, period: '2024-05' },
    { id: '3', name: 'Qwen Plus', type: 'monthly', total: 3000, used: 1890, remaining: 1110, alert_threshold: 70, period: '2024-05' },
  ]);

  const [permissions] = useState<Permission[]>([
    { id: '1', user: '张三', email: 'zhangsan@fipai.cn', role: 'admin', agents: ['早报助手', '匹配助手', '欢迎助手'], permissions: ['read', 'write', 'delete'], last_login: '2024-05-20 10:30:00' },
    { id: '2', user: '李四', email: 'lisi@fipai.cn', role: 'operator', agents: ['早报助手'], permissions: ['read', 'write'], last_login: '2024-05-19 18:00:00' },
    { id: '3', user: '王五', email: 'wangwu@fipai.cn', role: 'viewer', agents: ['早报助手', '匹配助手'], permissions: ['read'], last_login: '2024-05-18 09:15:00' },
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    { id: '1', time: '2024-05-20 10:30:00', user: '张三', action: '修改Agent', target: '早报助手', result: 'success', ip: '192.168.1.100' },
    { id: '2', time: '2024-05-20 10:15:00', user: '李四', action: '创建工作流', target: '供需分析流程', result: 'success', ip: '192.168.1.101' },
    { id: '3', time: '2024-05-20 09:45:00', user: '张三', action: '删除日志', target: '2024-04-01', result: 'failed', ip: '192.168.1.100' },
  ]);

  const roleMap = {
    admin: { label: '管理员', color: 'red' },
    operator: { label: '运营', color: 'blue' },
    viewer: { label: '查看', color: 'default' },
  };

  const budgetColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '周期', dataIndex: 'period', key: 'period', width: 100 },
    { title: '总额', dataIndex: 'total', key: 'total', width: 100, render: (v: number) => `$${v}` },
    { title: '已用', dataIndex: 'used', key: 'used', width: 100, render: (v: number) => `$${v}` },
    { title: '剩余', dataIndex: 'remaining', key: 'remaining', width: 100, render: (v: number) => `$${v}` },
    {
      title: '使用率',
      dataIndex: 'used',
      key: 'used',
      width: 150,
      render: (used: number, record: Budget) => {
        const percent = Math.round(used / record.total * 100);
        return <Progress percent={percent} size="small" status={percent >= record.alert_threshold ? 'exception' : 'normal'} />;
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: Budget) => {
        const percent = Math.round(record.used / record.total * 100);
        return percent >= record.alert_threshold
          ? <Tag color="error" icon={<ExclamationCircleOutlined />}>超限</Tag>
          : <Tag color="success">正常</Tag>;
      },
    },
  ];

  const permissionColumns = [
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (r: keyof typeof roleMap) => <Tag color={roleMap[r].color}>{roleMap[r].label}</Tag> },
    { title: 'Agent权限', dataIndex: 'agents', key: 'agents', render: (agents: string[]) => agents.join(', ') },
    { title: '最后登录', dataIndex: 'last_login', key: 'last_login', width: 160 },
  ];

  const auditColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '操作', dataIndex: 'action', key: 'action' },
    { title: '目标', dataIndex: 'target', key: 'target' },
    { title: '结果', dataIndex: 'result', key: 'result', width: 80, render: (r: 'success' | 'failed') => <Tag color={r === 'success' ? 'success' : 'error'}>{r === 'success' ? '成功' : '失败'}</Tag> },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
  ];

  const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + b.used, 0);

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Module F - 权限与预算</Title>
          <Text type="secondary">预算管控、权限矩阵、审计日志</Text>
        </div>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="总预算" value={`$${totalBudget}`} prefix={<DollarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已使用" value={`$${totalUsed}`} valueStyle={{ color: totalUsed / totalBudget > 0.8 ? '#ff4d4f' : '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="在线用户" value={permissions.length} prefix={<UserOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="今日审计" value={auditLogs.length} prefix={<AuditOutlined />} /></Card></Col>
      </Row>

      {/* 预算管理 */}
      <Card title={<Space><DollarOutlined /> 预算管控</Space>} style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={budgets} columns={budgetColumns} rowKey="id" pagination={false} />
      </Card>

      {/* 权限矩阵 */}
      <Card title={<Space><SafetyOutlined /> 权限矩阵</Space>} style={{ marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={permissions} columns={permissionColumns} rowKey="id" pagination={false} />
      </Card>

      {/* 审计日志 */}
      <Card title={<Space><AuditOutlined /> 审计日志</Space>} styles={{ body: { padding: 0 } }}>
        <Table dataSource={auditLogs} columns={auditColumns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}