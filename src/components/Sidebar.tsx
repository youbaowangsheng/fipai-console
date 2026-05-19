import { Layout, Menu, Button, Dropdown, Avatar, Switch } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, RobotOutlined, ThunderboltOutlined, SettingOutlined,
  MessageOutlined, ApiOutlined, ExperimentOutlined, UserOutlined, SafetyOutlined,
  LogoutOutlined, FileTextOutlined, ClockCircleOutlined, SyncOutlined,
  DatabaseOutlined, ApartmentOutlined, ClusterOutlined,
  UnorderedListOutlined, CommentOutlined, BookOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { getUserInfo } from '../utils/api';

interface SidebarProps {
  children: ReactNode;
}

type Theme = 'dark' | 'light';

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

const themes = {
  dark: {
    sidebarBg: '#1a1a2e',
    headerBg: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
    contentBg: '#fffaf5',
    headerText: '#fff',
  },
  light: {
    sidebarBg: '#f8f9fa',
    headerBg: '#fff',
    contentBg: '#f5f7fa',
    headerText: '#333',
    border: '#e8e8e8',
  },
};

export default function Sidebar({ children }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const token = localStorage.getItem('console_token');
    if (token) {
      getUserInfo().then(res => {
        if (res.data.success) setUser(res.data.user);
      }).catch(() => {});
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('console_token');
    navigate('/auth', { replace: true });
  };

  const currentTheme = themes[theme];

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: () => handleLogout(),
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Layout.Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: currentTheme.headerBg, padding: '0 32px', flex: '0 0 auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: theme === 'light' ? '1px solid #e8e8e8' : 'none'
      }}>
        <div style={{ color: currentTheme.headerText, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>
          🍳 FIP.AI Console
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: currentTheme.headerText }}>
            <SunOutlined style={{ fontSize: 14 }} />
            <Switch size="small" checked={theme === 'light'} onChange={handleThemeChange} />
            <MoonOutlined style={{ fontSize: 14 }} />
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ color: currentTheme.headerText }}>
              <Avatar size="small" style={{ backgroundColor: '#ff6b35', marginRight: 8 }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              {user?.email || '用户'}
            </Button>
          </Dropdown>
        </div>
      </Layout.Header>
      <Layout>
        <Layout.Sider width={320} style={{
          background: currentTheme.sidebarBg, flex: '0 0 320px',
          borderRight: theme === 'light' ? '1px solid #e8e8e8' : 'none'
        }}>
          <Menu
            theme={theme}
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
            style={{ height: '100%', overflow: 'auto', background: currentTheme.sidebarBg }}
          />
        </Layout.Sider>
        <Layout.Content style={{ background: currentTheme.contentBg, padding: 24, flex: 'auto', minWidth: 0 }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}