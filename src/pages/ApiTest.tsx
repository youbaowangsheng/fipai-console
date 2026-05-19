import { useState, useEffect } from 'react';
import { Card, Tabs, Input, Button, Space, Select, Table, Tag, message, Divider, Typography } from 'antd';
import { AimOutlined, SendOutlined, ReloadOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getSkills, invokeSkill, gwChat, gwRouteExplain, gwChannelChat, gwChannels } from '../utils/api';

const { TextArea } = Input;
const { Text } = Typography;

interface RouteResult {
  decision: string;
  message_length: number;
  matched_rules: Array<{ name: string; channel: string; priority: number }>;
  force_channel: string | null;
}

interface ChatResult {
  channel: string;
  content: string;
  error: string | null;
  metadata: any;
}

const TEST_CASES = {
  '通道一 (direct_llm)': [
    { message: '你好', expected: 'direct_llm' },
    { message: '什么是光合作用？', expected: 'direct_llm' },
    { message: '今天天气怎么样？', expected: 'direct_llm' },
  ],
  '通道二 (single_agent)': [
    { message: '帮我搜索最新的AI新闻', expected: 'single_agent' },
    { message: '计算 123 * 456', expected: 'single_agent' },
    { message: '北京今天天气', expected: 'single_agent' },
  ],
  '通道三 (multi_agent)': [
    { message: '帮我分析一下今年的AI发展趋势', expected: 'multi_agent' },
    { message: '我需要规划一个产品上线任务', expected: 'multi_agent' },
    { message: '讨论一下远程办公的优缺点', expected: 'multi_agent' },
  ],
  '路由边界测试': [
    { message: '分析', expected: 'multi_agent' },
    { message: '帮我搜索', expected: 'single_agent' },
    { message: 'hi', expected: 'direct_llm' },
  ],
};

export default function ApiTest() {
  const [activeTab, setActiveTab] = useState('route');
  const [loading, setLoading] = useState(false);

  // 路由测试
  const [routeMessage, setRouteMessage] = useState('');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  // 通道测试
  const [channelMessage, setChannelMessage] = useState('');
  const [channel, setChannel] = useState<string>('auto');
  const [sessionId, setSessionId] = useState('test_session');
  const [chatResult, setChatResult] = useState<ChatResult | null>(null);

  // Skill 测试
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillInput, setSkillInput] = useState('{}');
  const [skillResult, setSkillResult] = useState<any>(null);

  // 批量测试
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = () => {
    getSkills().then(res => setSkills(res.data.skills || [])).catch(() => {});
  };

  const handleRouteExplain = async () => {
    if (!routeMessage.trim()) {
      message.warning('请输入消息');
      return;
    }
    setLoading(true);
    try {
      // 使用 Gateway 的路由解释接口
      const res = await gwRouteExplain(routeMessage);
      setRouteResult(res.data);
    } catch (err: any) {
      message.error('路由测试失败: ' + (err.message || '未知错误'));
    }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!channelMessage.trim()) {
      message.warning('请输入消息');
      return;
    }
    setLoading(true);
    setChatResult(null);
    try {
      const res = await gwChat(channelMessage, sessionId, channel);
      setChatResult(res.data);
    } catch (err: any) {
      message.error('发送失败: ' + (err.message || '未知错误'));
    }
    setLoading(false);
  };

  const handleChannelChat = async (channelType: string) => {
    if (!channelMessage.trim()) {
      message.warning('请输入消息');
      return;
    }
    setLoading(true);
    try {
      const res = await gwChannelChat(channelType, channelMessage, sessionId);
      setChatResult(res.data);
    } catch (err: any) {
      message.error('发送失败: ' + (err.message || '未知错误'));
    }
    setLoading(false);
  };

  const handleSkillInvoke = async () => {
    if (!selectedSkill) {
      message.warning('请选择技能');
      return;
    }
    let inputData: any;
    try {
      inputData = JSON.parse(skillInput);
    } catch {
      message.error('请输入有效的 JSON');
      return;
    }
    setLoading(true);
    try {
      const res = await invokeSkill(selectedSkill, inputData);
      setSkillResult(res.data);
    } catch (err: any) {
      setSkillResult({ error: err.message || '调用失败' });
    }
    setLoading(false);
  };

  const runBatchTest = async () => {
    setBatchRunning(true);
    setBatchResults([]);
    const results: any[] = [];

    for (const [category, cases] of Object.entries(TEST_CASES)) {
      for (const testCase of cases as any[]) {
        try {
          const res = await fetch('http://120.46.41.158:8000/api/v1/chat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: testCase.message,
              session_id: 'batch_test',
              channel_hint: 'auto',
            }),
          });
          const data = await res.json();
          results.push({
            category,
            message: testCase.message,
            expected: testCase.expected,
            actual: data.channel || 'error',
            success: (data.channel || 'error') === testCase.expected,
            error: data.error,
          });
        } catch (err: any) {
          results.push({
            category,
            message: testCase.message,
            expected: testCase.expected,
            actual: 'error',
            success: false,
            error: err.message,
          });
        }
      }
    }

    setBatchResults(results);
    setBatchRunning(false);
  };

  const renderRouteResult = () => {
    if (!routeResult) return null;
    return (
      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>路由决策: </Text>
            <Tag color="blue" style={{ fontSize: 14 }}>{routeResult.decision}</Tag>
          </div>
          <div>
            <Text strong>消息长度: </Text>
            <Text>{routeResult.message_length} 字符</Text>
          </div>
          {routeResult.matched_rules.length > 0 && (
            <div>
              <Text strong>匹配规则:</Text>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                {routeResult.matched_rules.map((rule, i) => (
                  <li key={i}>
                    <Tag>{rule.name}</Tag> → <Tag color="green">{rule.channel}</Tag> (优先级 {rule.priority})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {routeResult.force_channel && (
            <div>
              <Text strong>强制通道: </Text>
              <Tag color="orange">{routeResult.force_channel}</Tag>
            </div>
          )}
        </Space>
      </div>
    );
  };

  const renderChatResult = () => {
    if (!chatResult) return null;
    return (
      <div style={{ background: chatResult.error ? '#fff2f0' : '#f6ffed', padding: 16, borderRadius: 8, border: `1px solid ${chatResult.error ? '#ffccc7' : '#b7eb8f'}` }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>实际通道: </Text>
            <Tag color={chatResult.error ? 'red' : 'green'}>{chatResult.channel || 'unknown'}</Tag>
          </div>
          {chatResult.error ? (
            <div style={{ color: '#ff4d4f' }}>
              <Text strong>错误: </Text>
              <Text type="danger">{chatResult.error}</Text>
            </div>
          ) : (
            <div>
              <Text strong>回复:</Text>
              <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{chatResult.content}</div>
            </div>
          )}
          {chatResult.metadata && Object.keys(chatResult.metadata).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text strong>元数据:</Text>
              <pre style={{ background: '#fff', padding: 8, borderRadius: 4, fontSize: 11, overflow: 'auto' }}>
                {JSON.stringify(chatResult.metadata, null, 2)}
              </pre>
            </div>
          )}
        </Space>
      </div>
    );
  };

  const batchColumns = [
    { title: '分类', dataIndex: 'category', key: 'category', width: 150 },
    { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: '预期', dataIndex: 'expected', key: 'expected', width: 100 },
    { title: '实际', dataIndex: 'actual', key: 'actual', width: 100 },
    { title: '结果', dataIndex: 'success', key: 'success', width: 80, render: (v: boolean) => v ? <Tag color="green">✅ 通过</Tag> : <Tag color="red">❌ 失败</Tag> },
    { title: '错误', dataIndex: 'error', key: 'error', ellipsis: true },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>API 测试工具</h1>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab={<span><AimOutlined /> 路由解释</span>} key="route">
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                rows={2}
                placeholder="输入消息，查看会被路由到哪个通道..."
                value={routeMessage}
                onChange={e => setRouteMessage(e.target.value)}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={handleRouteExplain} loading={loading}>
                分析路由
              </Button>
              {renderRouteResult()}
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span><SendOutlined /> 通道聊天</span>} key="chat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                rows={3}
                placeholder="输入消息..."
                value={channelMessage}
                onChange={e => setChannelMessage(e.target.value)}
              />
              <Space>
                <Input placeholder="session_id" value={sessionId} onChange={e => setSessionId(e.target.value)} style={{ width: 150 }} />
                <Select value={channel} onChange={setChannel} style={{ width: 150 }}>
                  <Select.Option value="auto">自动路由</Select.Option>
                  <Select.Option value="direct_llm">通道一</Select.Option>
                  <Select.Option value="single_agent">通道二</Select.Option>
                  <Select.Option value="multi_agent">通道三</Select.Option>
                </Select>
                <Button type="primary" icon={<SendOutlined />} onClick={handleChat} loading={loading}>
                  发送
                </Button>
              </Space>
              <Divider>或直接测试指定通道</Divider>
              <Space>
                <Button onClick={() => handleChannelChat('direct_llm')} loading={loading}>通道一 (直接LLM)</Button>
                <Button onClick={() => handleChannelChat('single_agent')} loading={loading}>通道二 (单智能体)</Button>
                <Button onClick={() => handleChannelChat('multi_agent')} loading={loading}>通道三 (多智能体)</Button>
              </Space>
              {renderChatResult()}
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span><PlayCircleOutlined /> Skill 调用</span>} key="skill">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Select
                  placeholder="选择技能"
                  style={{ width: 200 }}
                  value={selectedSkill}
                  onChange={setSelectedSkill}
                  options={skills.map(s => ({ value: s.name, label: s.name }))}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchSkills}>刷新技能</Button>
              </Space>
              <div>
                <Text strong>输入参数 (JSON):</Text>
                <TextArea
                  rows={4}
                  placeholder='{"expression": "100-20"}'
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSkillInvoke} loading={loading}>
                执行技能
              </Button>
              {skillResult && (
                <div style={{ background: skillResult.error ? '#fff2f0' : '#f6ffed', padding: 16, borderRadius: 8 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(skillResult, null, 2)}</pre>
                </div>
              )}
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span><PlayCircleOutlined /> 批量测试</span>} key="batch">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>一键测试所有预设用例，验证路由是否按预期工作</Text>
              <Button type="primary" onClick={runBatchTest} loading={batchRunning} icon={<PlayCircleOutlined />}>
                运行所有测试 ({Object.values(TEST_CASES).flat().length} 个用例)
              </Button>
              {batchResults.length > 0 && (
                <>
                  <div style={{ marginTop: 16 }}>
                    <Text strong>
                      通过率: {batchResults.filter(r => r.success).length}/{batchResults.length}
                    </Text>
                    <span style={{ marginLeft: 16 }}>
                      <Tag color="green">{(batchResults.filter(r => r.success).length / batchResults.length * 100).toFixed(0)}%</Tag>
                    </span>
                  </div>
                  <Table
                    dataSource={batchResults}
                    columns={batchColumns}
                    rowKey={(_, index) => String(index ?? 0)}
                    size="small"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                  />
                </>
              )}
            </Space>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span><CheckCircleOutlined /> 健康检查</span>} key="health">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" onClick={() => {
                fetch('http://120.46.41.158:8000/api/v1/health/')
                  .then(r => r.json())
                  .then(data => {
                    const lines = ['Gateway 健康检查结果:', ''];
                    Object.entries(data).forEach(([k, v]) => {
                      lines.push(`${k}: ${JSON.stringify(v)}`);
                    });
                    alert(lines.join('\n'));
                  })
                  .catch(err => alert('错误: ' + err.message));
              }}>检查 Gateway</Button>
              <Button onClick={() => {
                gwChannels().then((res: any) => {
                  const lines = ['通道列表:', ''];
                  res.data.channels?.forEach((ch: any) => {
                    lines.push(`${ch.name}: ${ch.health}`);
                  });
                  alert(lines.join('\n'));
                });
              }}>检查通道</Button>
              <Button onClick={() => {
                getSkills().then(res => {
                  const lines = ['技能列表:', ''];
                  res.data.skills?.forEach((s: any) => {
                    lines.push(`${s.name}: ${s.description}`);
                  });
                  alert(lines.join('\n'));
                });
              }}>检查技能</Button>
            </Space>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}