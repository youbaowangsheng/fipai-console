import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, RobotOutlined, ThunderboltOutlined, SettingOutlined,
  MessageOutlined, ApiOutlined, ExperimentOutlined, UserOutlined, SafetyOutlined,
  LogoutOutlined, FileTextOutlined, ClockCircleOutlined, SyncOutlined,
  DatabaseOutlined, ApartmentOutlined, ClusterOutlined,
  UnorderedListOutlined, CommentOutlined, BookOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { getUserInfo } from '../utils/api';

interface SidebarProps {
  children: ReactNode;
}

const workbenchItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '监控面板' },
  { key: '/agents', icon: <RobotOutlined />, label: 'Agent 管理' },
  { key: '/prompt-editor', icon: <FileTextOutlined />, label: 'Prompt 编辑器' },
  { key: '/trigger-config', icon: <ClockCircleOutlined />, label: '触发配置' },
  { key: '/skills', icon: <ThunderboltOutlined />, label: 'Skill 列表' },
  { key: '/workflows', icon: <MessageOutlined />, label: '工作流' },
  { key: '/documentation', icon: <BookOutlined />, label: '文档中心' },
];

const runtimeItems: MenuProps['items'] = [
  { key: '/runtime', icon: <ClusterOutlined />, label: '模块总览' },
  { type: 'divider' },
  { key: '/runtime/module-a', icon: <SyncOutlined />, label: '调度与路由' },
  { key: '/runtime/module-b', icon: <DatabaseOutlined />, label: '记忆与上下文' },
  { key: '/runtime/module-c', icon: <ApartmentOutlined />, label: '协作编排' },
  { key: '/runtime/module-d', icon: <ExperimentOutlined />, label: '版本管理' },
  { key: '/runtime/module-e', icon: <CommentOutlined />, label: '反馈优化' },
  { key: '/runtime/module-f', icon: <SafetyOutlined />, label: '权限与预算' },
];

const systemItems: MenuProps['items'] = [
  { key: '/channels', icon: <ApiOutlined />, label: '通道路由' },
  { key: '/api-test', icon: <ExperimentOutlined />, label: 'API 测试' },
  { key: '/auth', icon: <UserOutlined />, label: '用户权限' },
  { key: '/system', icon: <SafetyOutlined />, label: '模型配置' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const menuItems: MenuProps['items'] = [
  { label: '工作台', key: 'workbench', icon: <UnorderedListOutlined />, children: workbenchItems },
  { label: '运行时管理', key: 'runtime', icon: <ClusterOutlined />, children: runtimeItems },
  { label: '系统', key: 'system', icon: <SettingOutlined />, children: systemItems },
];

export default function Sidebar({ children }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('console_token');
    if (token) {
      getUserInfo().then(res => {
        if (res.data.success) setUser(res.data.user);
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('console_token');
    navigate('/auth', { replace: true });
  };

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: () => handleLogout(),
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529', padding: '0 24px' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          FIP.AI Console
        </div>
        <Dropdown menu={userMenu} placement="bottomRight">
          <Button type="text" style={{ color: '#fff' }}>
            <Avatar size="small" style={{ backgroundColor: '#1890ff', marginRight: 8 }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            {user?.email || '用户'}
          </Button>
        </Dropdown>
      </Layout.Header>
      <Layout>
        <Layout.Sider width={220} style={{ background: '#001529' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
          />
        </Layout.Sider>
        <Layout.Content style={{ background: '#f0f2f5', padding: 16 }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}