import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import AgentNew from './pages/AgentNew';
import PromptEditor from './pages/PromptEditor';
import TriggerConfig from './pages/TriggerConfig';
import RuntimeOverview from './pages/RuntimeOverview';
import ModuleA from './pages/ModuleA';
import ModuleB from './pages/ModuleB';
import ModuleC from './pages/ModuleC';
import ModuleD from './pages/ModuleD';
import ModuleE from './pages/ModuleE';
import ModuleF from './pages/ModuleF';
import Documentation from './pages/Documentation';
import Skills from './pages/Skills';
import SkillNew from './pages/SkillNew';
import Workflows from './pages/Workflows';
import Settings from './pages/Settings';
import Channels from './pages/Channels';
import ApiTest from './pages/ApiTest';
import Auth from './pages/Auth';
import SystemConfig from './pages/SystemConfig';
import { getUserInfo } from './utils/api';

function AppLayout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('console_token');
    if (!token) {
      setChecking(false);
      return;
    }
    getUserInfo()
      .then(res => {
        if (res.data.success) setIsLoggedIn(true);
        else localStorage.removeItem('console_token');
      })
      .catch(() => localStorage.removeItem('console_token'))
      .finally(() => setChecking(false));
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/', { replace: true });
  };

  if (checking) return null;

  if (!isLoggedIn) {
    return <Auth onLogin={handleLoginSuccess} />;
  }

  return (
    <Sidebar>
      <Routes>
        <Route path="/auth" element={<Auth onLogin={handleLoginSuccess} />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/agents/:id/edit" element={<AgentNew />} />
        <Route path="/agents/new" element={<AgentNew />} />
        <Route path="/prompt-editor" element={<PromptEditor />} />
        <Route path="/trigger-config" element={<TriggerConfig />} />
        <Route path="/runtime" element={<RuntimeOverview />} />
        <Route path="/runtime/module-a" element={<ModuleA />} />
        <Route path="/runtime/module-b" element={<ModuleB />} />
        <Route path="/runtime/module-c" element={<ModuleC />} />
        <Route path="/runtime/module-d" element={<ModuleD />} />
        <Route path="/runtime/module-e" element={<ModuleE />} />
        <Route path="/runtime/module-f" element={<ModuleF />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/skills/new" element={<SkillNew />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/system" element={<SystemConfig />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Sidebar>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}