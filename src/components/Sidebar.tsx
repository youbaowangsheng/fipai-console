import { Layout, Menu, Button, Dropdown, Avatar, Switch, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, RobotOutlined, ThunderboltOutlined, SettingOutlined,
  MessageOutlined, ApiOutlined, ExperimentOutlined, UserOutlined, SafetyOutlined,
  LogoutOutlined, FileTextOutlined, ClockCircleOutlined, SyncOutlined,
  DatabaseOutlined, ApartmentOutlined, ClusterOutlined,
  UnorderedListOutlined, CommentOutlined, BookOutlined, SunOutlined, MoonOutlined,
  HomeOutlined, MenuOutlined
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Breadcrumb mapping
  const pathMap: Record<string, { label: string; parent?: string }> = {
    '/': { label: '监控面板' },
    '/agents': { label: 'Agent 管理' },
    '/agents/new': { label: '新建 Agent', parent: '/agents' },
    '/prompt-editor': { label: 'Prompt 编辑器' },
    '/trigger-config': { label: '触发配置' },
    '/runtime': { label: '模块总览' },
    '/runtime/module-a': { label: '调度与路由', parent: '/runtime' },
    '/runtime/module-b': { label: '记忆与上下文', parent: '/runtime' },
    '/runtime/module-c': { label: '协作编排', parent: '/runtime' },
    '/runtime/module-d': { label: '版本管理', parent: '/runtime' },
    '/runtime/module-e': { label: '反馈优化', parent: '/runtime' },
    '/runtime/module-f': { label: '权限与预算', parent: '/runtime' },
    '/documentation': { label: '文档中心' },
    '/skills': { label: 'Skill 列表' },
    '/skills/new': { label: '新建 Skill', parent: '/skills' },
    '/workflows': { label: '工作流' },
    '/channels': { label: '通道路由' },
    '/api-test': { label: 'API 测试' },
    '/auth': { label: '用户权限' },
    '/system': { label: '模型配置' },
    '/settings': { label: '系统设置' },
  };

  const currentPath = pathMap[location.pathname] || { label: location.pathname };
  const breadcrumbItems = [
    { title: <HomeOutlined />, href: '/' },
    ...(currentPath.parent ? [{ title: pathMap[currentPath.parent]?.label || currentPath.parent, href: currentPath.parent }] : []),
    { title: currentPath.label },
  ];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Layout.Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: currentTheme.headerBg, padding: '0 24px', flex: '0 0 auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: theme === 'light' ? '1px solid #e8e8e8' : 'none'
      }}>
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: currentTheme.headerText }}
          />
        )}
        <div style={{ color: currentTheme.headerText, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>
          🍳 FIP.AI Console
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: currentTheme.headerText }}>
              <SunOutlined style={{ fontSize: 14 }} />
              <Switch size="small" checked={theme === 'light'} onChange={handleThemeChange} />
              <MoonOutlined style={{ fontSize: 14 }} />
            </div>
          )}
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ color: currentTheme.headerText }}>
              <Avatar size="small" style={{ backgroundColor: '#ff6b35', marginRight: 8 }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              {!isMobile && (user?.email || '用户')}
            </Button>
          </Dropdown>
        </div>
      </Layout.Header>
      <Layout>
        <Layout.Sider
          width={320}
          style={{
            background: currentTheme.sidebarBg, flex: '0 0 320px',
            borderRight: theme === 'light' ? '1px solid #e8e8e8' : 'none',
            position: isMobile ? 'absolute' : 'relative',
            zIndex: 10,
            height: isMobile ? 'calc(100vh - 64px)' : 'auto',
            display: mobileMenuOpen || !isMobile ? 'block' : 'none',
            left: 0,
            top: 0,
          }}
          className="mobile-sider"
        >
          <Menu
            theme={theme}
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => { navigate(key); setMobileMenuOpen(false); }}
            items={menuItems}
            style={{ height: '100%', overflow: 'auto', background: currentTheme.sidebarBg }}
          />
        </Layout.Sider>
        {isMobile && mobileMenuOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <Layout.Content style={{
          background: currentTheme.contentBg,
          padding: isMobile ? 16 : 24,
          flex: 'auto',
          minWidth: 0,
          marginLeft: isMobile ? 0 : undefined
        }}>
          <Breadcrumb style={{ marginBottom: 16 }} items={breadcrumbItems} />
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}