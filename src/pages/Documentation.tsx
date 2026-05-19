import { useState } from 'react';
import { Card, Typography, List, Tag, Button, Space, Input, Collapse, Divider, Table, Modal, message } from 'antd';
import {
  BookOutlined, ApiOutlined, ThunderboltOutlined, BulbOutlined,
  AlertOutlined, KeyOutlined, GlobalOutlined, DatabaseOutlined,
  SearchOutlined, CopyOutlined, LinkOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  name: string;
  desc: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  body?: { name: string; type: string; desc: string }[];
}

const apiGroups = [
  {
    title: '认证 Auth',
    icon: <KeyOutlined />,
    endpoints: [
      { method: 'POST', path: '/api/auth/login/', name: '登录', desc: '用户登录获取token', params: [{ name: 'email', type: 'string', required: true, desc: '邮箱' }, { name: 'password', type: 'string', required: true, desc: '密码' }] },
      { method: 'POST', path: '/api/auth/register/', name: '注册', desc: '新用户注册', params: [{ name: 'email', type: 'string', required: true, desc: '邮箱' }, { name: 'password', type: 'string', required: true, desc: '密码' }, { name: 'name', type: 'string', required: true, desc: '用户名' }] },
      { method: 'GET', path: '/api/auth/userinfo/', name: '用户信息', desc: '获取当前用户信息' },
      { method: 'POST', path: '/api/auth/logout/', name: '登出', desc: '注销当前会话' },
    ],
  },
  {
    title: 'Agent 管理',
    icon: <GlobalOutlined />,
    endpoints: [
      { method: 'GET', path: '/api/agents/', name: '列表', desc: '获取所有Agent' },
      { method: 'POST', path: '/api/agents/', name: '创建', desc: '创建新Agent', body: [{ name: 'name', type: 'string', desc: 'Agent名称' }, { name: 'type', type: 'string', desc: 'Agent类型' }] },
      { method: 'GET', path: '/api/agents/:id/', name: '详情', desc: '获取Agent详情' },
      { method: 'PUT', path: '/api/agents/:id/', name: '更新', desc: '更新Agent配置' },
      { method: 'DELETE', path: '/api/agents/:id/', name: '删除', desc: '删除Agent' },
    ],
  },
  {
    title: 'Channels 通道',
    icon: <ApiOutlined />,
    endpoints: [
      { method: 'GET', path: '/api/channels/channels/', name: '通道列表', desc: '获取所有可用通道（direct_llm/single_agent/multi_agent）' },
      { method: 'GET', path: '/api/channels/route/explain/', name: '路由解释', desc: '查看消息会走哪个通道及原因', params: [{ name: 'message', type: 'string', required: true, desc: '用户消息' }] },
      { method: 'POST', path: '/api/channels/chat/', name: '对话', desc: '通用对话入口（自动路由）', body: [{ name: 'message', type: 'string', required: true, desc: '消息内容' }, { name: 'session_id', type: 'string', required: false, desc: '会话ID' }] },
      { method: 'POST', path: '/api/channels/direct/', name: '直接LLM', desc: '通道一直连LLM（简单问答）' },
      { method: 'POST', path: '/api/channels/agent/', name: '单Agent', desc: '通道二单Agent+技能' },
      { method: 'POST', path: '/api/channels/multi/', name: '多Agent', desc: '通道三多Agent编排' },
    ],
  },
  {
    title: 'Skills 技能',
    icon: <ThunderboltOutlined />,
    endpoints: [
      { method: 'GET', path: '/api/channels/skills/', name: '技能列表', desc: '获取所有可用技能（calculator/weather/web_search等）' },
      { method: 'POST', path: '/api/channels/skills/invoke/', name: '调用技能', desc: '调用指定技能', body: [{ name: 'skill_name', type: 'string', required: true, desc: '技能名称' }, { name: 'input', type: 'object', required: true, desc: '输入参数' }] },
    ],
  },
  {
    title: 'Workflows 工作流',
    icon: <DatabaseOutlined />,
    endpoints: [
      { method: 'GET', path: '/api/channels/workflows/', name: '工作流列表', desc: '获取所有工作流模板' },
      { method: 'GET', path: '/api/workflows/editor/<id>/', name: '编辑器', desc: '打开工作流编辑器' },
      { method: 'POST', path: '/api/workflows/save/', name: '保存', desc: '保存工作流配置' },
      { method: 'POST', path: '/api/workflows/run/', name: '执行', desc: '触发工作流执行' },
      { method: 'GET', path: '/api/workflows/execution/<id>/', name: '执行详情', desc: '查看执行结果' },
    ],
  },
  {
    title: 'Dashboard 统计',
    icon: <BulbOutlined />,
    endpoints: [
      { method: 'GET', path: '/api/dashboard/stats/', name: '统计数据', desc: '获取系统运行统计' },
      { method: 'POST', path: '/api/dashboard/record/', name: '记录请求', desc: '上报请求数据（供gateway调用）' },
    ],
  },
];

const tutorials = [
  { title: '教程1：创建"每日早报"Agent', time: '10分钟', desc: '从零开始创建一个能自动生成早报的Agent', tags: ['Agent', '定时触发'] },
  { title: '教程2：创建"用户问题分类"Agent', time: '8分钟', desc: '使用Prompt编辑器配置分类逻辑', tags: ['Prompt', '分类'] },
  { title: '教程3：创建"新用户欢迎"工作流', time: '15分钟', desc: '配置事件触发+多步骤工作流', tags: ['Workflow', '事件触发'] },
  { title: '教程4：配置供需自动匹配', time: '12分钟', desc: '使用技能市场搭建匹配流程', tags: ['Skill', '匹配'] },
];

const patterns = [
  { title: '模式1：输入→分析→输出', desc: '最简单的3步模式：接收输入 → LLM分析 → 返回结果', icon: '📥→🧠→📤' },
  { title: '模式2：输入→条件分支→不同处理', desc: '根据输入内容走不同分支，如：简单问题→直接回答，复杂问题→多步分析', icon: '📥→🔀→❶/❷' },
  { title: '模式3：批量处理→汇总结果', desc: '将大批量数据拆分成多个任务并行处理，最后汇总', icon: '📚→⚡→📊' },
  { title: '模式4：定时扫描→发现→通知', desc: '定时触发 → 扫描数据 → 发现目标 → 推送通知', icon: '⏰→🔍→🎯→📢' },
];

const promptTips = [
  { title: '清晰的角色定义', desc: '在System Prompt中明确Agent的身份和能力范围' },
  { title: '结构化的输出格式', desc: '使用JSON Schema定义输出结构，让LLM返回格式化的结果' },
  { title: 'Few-shot示例', desc: '提供2-3个输入→输出示例，帮助LLM理解期望格式' },
  { title: '变量使用规范', desc: '使用{变量名}引用动态内容，如{user_input}、{current_time}' },
  { title: '错误处理提示', desc: '在Prompt中说明遇到错误时的处理方式' },
];

const troubleshooting = [
  { q: 'Agent不响应？', a: '1. 检查Agent是否启用 2. 检查触发条件配置 3. 查看监控面板日志 4. 确认API调用权限' },
  { q: '输出格式不对？', a: '1. 检查System Prompt中的格式要求 2. 查看输出Schema配置 3. 添加Few-shot示例明确格式' },
  { q: 'Token费用太高？', a: '1. 减少Context窗口大小 2. 优化Prompt减少不必要的描述 3. 启用缓存减少重复调用' },
  { q: '路由结果不符合预期？', a: '1. 查看路由解释（/api/channels/route/explain/）了解判断依据 2. 调整路由规则优先级' },
];

const methodColors: Record<string, string> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  DELETE: 'red',
};

export default function Documentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [activeTab, setActiveTab] = useState('tutorials');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* 左侧导航 */}
      <div style={{ width: 280, background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto', padding: 16 }}>
        <Search placeholder="搜索文档..." prefix={<SearchOutlined />} style={{ marginBottom: 16 }} />

        <List
          dataSource={[
            { key: 'tutorials', icon: <BookOutlined />, label: '新手入门', count: 4 },
            { key: 'api', icon: <ApiOutlined />, label: 'API 文档', count: 6 },
            { key: 'patterns', icon: <BulbOutlined />, label: '设计模式', count: 4 },
            { key: 'prompt', icon: <BookOutlined />, label: 'Prompt技巧', count: 5 },
            { key: 'skills', icon: <ThunderboltOutlined />, label: '技能开发' },
            { key: 'troubleshoot', icon: <AlertOutlined />, label: '故障排查', count: 4 },
          ]}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '12px', borderRadius: 8, background: activeTab === item.key ? '#e6f7ff' : 'transparent' }}
              onClick={() => setActiveTab(item.key)}
            >
              <Space>
                {item.icon}
                {item.label}
                {item.count && item.count > 0 && <Tag>{item.count}</Tag>}
              </Space>
            </List.Item>
          )}
        />
      </div>

      {/* 右侧内容 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {activeTab === 'tutorials' && (
          <div>
            <Title level={4}>新手入门（30分钟上手）</Title>
            <Text type="secondary">跟着教程一步步操作，快速掌握FIPAI Agent的创建和使用</Text>
            <Divider />
            <List
              dataSource={tutorials}
              renderItem={(t) => (
                <List.Item>
                  <Card style={{ width: '100%' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{t.title}</Text>
                        <br />
                        <Text type="secondary">{t.desc}</Text>
                        <br />
                        <Space style={{ marginTop: 8 }}>
                          <Tag>{t.time}</Tag>
                          {t.tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
                        </Space>
                      </div>
                      <Button type="link" icon={<LinkOutlined />}>开始学习</Button>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        {activeTab === 'api' && (
          <div>
            <Title level={4}>API 文档</Title>
            <Text type="secondary">完整的REST API参考，支持Swagger UI在线调试</Text>
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<ApiOutlined />} onClick={() => window.open('https://fipai.cn/api/v1/docs', '_blank')}>
                打开 Swagger UI
              </Button>
              <Button icon={<GlobalOutlined />} onClick={() => window.open('https://fipai.cn/api/v1/', '_blank')}>
                API Root
              </Button>
            </Space>
            <Divider />

            {apiGroups.map(group => (
              <Card key={group.title} size="small" style={{ marginBottom: 16 }} title={<Space>{group.icon}{group.title}</Space>}>
                <List
                  size="small"
                  dataSource={group.endpoints}
                  renderItem={(ep) => (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedEndpoint(ep as any)}
                    >
                      <Space>
                        <Tag color={methodColors[ep.method]}>{ep.method}</Tag>
                        <Text code>{ep.path}</Text>
                        <Text>{ep.name}</Text>
                        <Text type="secondary">- {ep.desc}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div>
            <Title level={4}>工作流设计模式</Title>
            <Text type="secondary">常见的工作流编排模式，帮助你快速搭建业务逻辑</Text>
            <Divider />
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={patterns}
              renderItem={(p) => (
                <List.Item>
                  <Card size="small">
                    <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{p.icon}</div>
                    <Text strong>{p.title}</Text>
                    <br />
                    <Text type="secondary">{p.desc}</Text>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        {activeTab === 'prompt' && (
          <div>
            <Title level={4}>Prompt 工程最佳实践</Title>
            <Text type="secondary">如何写出高质量的System Prompt，让Agent表现更准确</Text>
            <Divider />
            <List
              dataSource={promptTips}
              renderItem={(tip) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Text strong style={{ color: '#1890ff' }}>{tip.title}</Text>
                    <br />
                    <Text>{tip.desc}</Text>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <Title level={4}>技能开发指南</Title>
            <Text type="secondary">如何注册自定义Skill，扩展Agent能力</Text>
            <Divider />
            <Card>
              <Title level={5}>技能注册流程</Title>
              <Steps
                items={[
                  { title: '定义技能元数据', description: '名称、描述、图标、分类' },
                  { title: '实现输入输出', description: '定义参数和返回值格式' },
                  { title: '注册到技能市场', description: '发布供其他用户使用' },
                ]}
              />
            </Card>
          </div>
        )}

        {activeTab === 'troubleshoot' && (
          <div>
            <Title level={4}>故障排查</Title>
            <Text type="secondary">常见问题及解决方案</Text>
            <Divider />
            <Collapse>
              {troubleshooting.map((item, i) => (
                <Panel header={<Text strong>{item.q}</Text>} key={i}>
                  <Paragraph>{item.a}</Paragraph>
                </Panel>
              ))}
            </Collapse>
          </div>
        )}
      </div>

      {/* API详情弹窗 */}
      <Modal
        title={selectedEndpoint ? `${selectedEndpoint.method} ${selectedEndpoint.path}` : ''}
        open={!!selectedEndpoint}
        onCancel={() => setSelectedEndpoint(null)}
        footer={null}
        width={600}
      >
        {selectedEndpoint && (
          <div>
            <Tag color={methodColors[selectedEndpoint.method]}>{selectedEndpoint.method}</Tag>
            <Text code style={{ fontSize: 16 }}>{selectedEndpoint.path}</Text>
            <Divider />
            <Text strong>{selectedEndpoint.desc}</Text>
            <Divider />

            {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
              <>
                <Text strong>请求参数</Text>
                <Table
                  size="small"
                  dataSource={selectedEndpoint.params}
                  rowKey="name"
                  pagination={false}
                  columns={[
                    { title: '参数名', dataIndex: 'name', key: 'name', render: (t: string) => <code>{t}</code> },
                    { title: '类型', dataIndex: 'type', key: 'type' },
                    { title: '必填', dataIndex: 'required', key: 'required', render: (r: boolean) => r ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
                    { title: '说明', dataIndex: 'desc', key: 'desc' },
                  ]}
                />
                <Divider />
              </>
            )}

            {selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
              <>
                <Text strong>请求体</Text>
                <Table
                  size="small"
                  dataSource={selectedEndpoint.body}
                  rowKey="name"
                  pagination={false}
                  columns={[
                    { title: '字段', dataIndex: 'name', key: 'name', render: (t: string) => <code>{t}</code> },
                    { title: '类型', dataIndex: 'type', key: 'type' },
                    { title: '说明', dataIndex: 'desc', key: 'desc' },
                  ]}
                />
              </>
            )}

            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(`curl -X ${selectedEndpoint.method} https://fipai.cn${selectedEndpoint.path}`)}
              style={{ marginTop: 16 }}
            >
              复制 cURL 命令
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// 简单的 Steps 组件
const Steps = ({ items }: { items: { title: string; description: string }[] }) => (
  <div style={{ display: 'flex', gap: 16 }}>
    {items.map((item, i) => (
      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#1890ff', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 8px'
        }}>{i + 1}</div>
        <Text strong>{item.title}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
      </div>
    ))}
  </div>
);