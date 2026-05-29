import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Table, Tag, Space, Typography, Modal, Avatar } from 'antd';
import { LockOutlined, UserOutlined, SafetyOutlined, LogoutOutlined, PlusOutlined, MailOutlined } from '@ant-design/icons';
import { login as apiLogin, logout as apiLogout, getUserInfo, register as apiRegister } from '../utils/api';

const { Title, Text } = Typography;

interface OperationLog {
  id: number;
  time: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  status: 'success' | 'failed';
  details: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  is_staff: boolean;
  is_active: boolean;
}

interface Props {
  onLogin?: () => void;
}

export default function Auth({ onLogin }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loginForm] = Form.useForm();
  const [registerVisible, setRegisterVisible] = useState(false);
  const [registerForm] = Form.useForm();

  const checkLoginStatus = () => {
    const token = localStorage.getItem('console_token');
    if (token) {
      getUserInfo().then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          setIsLoggedIn(true);
        }
      }).catch(() => {
        // 401 错误静默处理，不清除 token，不跳转（Auth 页面自己处理登录状态）
      });
    }
  };

  useEffect(() => {
    checkLoginStatus();
    setLogs([
      { id: 1, time: '2026-05-17 10:30:25', user: 'admin@fipai.cn', action: '登录', target: '系统', ip: '192.168.1.100', status: 'success', details: '登录成功' },
      { id: 2, time: '2026-05-17 10:28:10', user: 'admin@fipai.cn', action: '修改配置', target: 'API Key', ip: '192.168.1.100', status: 'success', details: '更新了 DeepSeek API Key' },
      { id: 3, time: '2026-05-17 09:45:33', user: 'admin@fipai.cn', action: '通道配置', target: '权重分配', ip: '192.168.1.100', status: 'success', details: '修改了 single_agent 权重 40%→50%' },
    ]);
  }, []);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiLogin(values.email, values.password);
      if (response.data.success) {
        localStorage.setItem('console_token', response.data.token);
        setUser(response.data.user);
        setIsLoggedIn(true);
        message.success('登录成功');
        addLog('登录', '系统', 'success', '登录成功');
        onLogin?.();
      } else {
        message.error(response.data.error || '登录失败');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '登录失败，请检查账号密码';
      message.error(errorMsg);
      addLog('登录', '系统', 'failed', errorMsg);
    }
    setLoading(false);
  };

  const handleRegister = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      const response = await apiRegister(values.email, values.password, values.name);
      if (response.data.success) {
        message.success('注册成功');
        setRegisterVisible(false);
        registerForm.resetFields();
      } else {
        message.error(response.data.error || '注册失败');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '注册失败';
      message.error(errorMsg);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    apiLogout().catch(() => {}).finally(() => {
      localStorage.removeItem('console_token');
      setUser(null);
      setIsLoggedIn(false);
      message.success('已退出登录');
    });
  };

  const addLog = (action: string, target: string, status: 'success' | 'failed', details: string) => {
    const newLog: OperationLog = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      user: user?.email || '游客',
      action,
      target,
      ip: '127.0.0.1',
      status,
      details,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const logColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '用户', dataIndex: 'user', key: 'user', width: 150 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 80 },
    { title: '对象', dataIndex: 'target', key: 'target', width: 100 },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 70, render: (v: 'success' | 'failed') => <Tag color={v === 'success' ? 'green' : 'red'}>{v === 'success' ? '成功' : '失败'}</Tag> },
    { title: '详情', dataIndex: 'details', key: 'details', ellipsis: true },
  ];

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Card
          style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          styles={{ body: { padding: 40 } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Avatar size={64} style={{ background: '#1890ff', marginBottom: 16 }}>
              <SafetyOutlined style={{ fontSize: 32 }} />
            </Avatar>
            <Title level={3} style={{ margin: 0 }}>FIP.AI Console</Title>
            <Text type="secondary">管理登录</Text>
          </div>
          <Form form={loginForm} onFinish={handleLogin} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
              <Input prefix={<UserOutlined />} placeholder="邮箱" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ borderRadius: 8, height: 44 }}>
              登录
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#fffaf5" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>用户权限管理</Title>
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Card
          title="当前用户信息"
          style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          bordered={false}
        >
          <Space align="start">
            <Avatar size={48} style={{ background: '#1890ff' }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Space direction="vertical" size={4}>
              <Space>
                <MailOutlined />
                <Text strong>{user?.email}</Text>
              </Space>
              <Space size={16}>
                <Tag color={user?.is_staff ? 'green' : 'default'}>
                  {user?.is_staff ? '管理员' : '普通用户'}
                </Tag>
                <Text type="secondary">ID: {user?.id}</Text>
              </Space>
            </Space>
          </Space>
        </Card>

        <Card
          title="注册新账号"
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterVisible(true)} size="small">添加用户</Button>}
          style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          bordered={false}
        >
          <Text type="secondary">通过 Django Admin 创建的用户可以使用此邮箱登录。</Text>
        </Card>

        <Card
          title="操作日志"
          style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          bordered={false}
        >
          <Table
            dataSource={logs}
            columns={logColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
            locale={{ emptyText: '暂无操作记录' }}
          />
        </Card>
      </Space>

      <Modal
        title="注册新账号"
        open={registerVisible}
        onCancel={() => setRegisterVisible(false)}
        footer={null}
      >
        <Form form={registerForm} onFinish={handleRegister} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="name" label="姓名">
            <Input placeholder="您的姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="邮箱地址" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password placeholder="密码（至少6位）" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password placeholder="确认密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            注册
          </Button>
        </Form>
      </Modal>
    </div>
  );
}