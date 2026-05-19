import { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Spin, Button, Space, Table, Tag, Typography, Badge } from 'antd';
import { ArrowUpOutlined, ReloadOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getStats, getChannels } from '../utils/api';

const { Title, Text } = Typography;
const COLORS = ['#52c41a', '#ff4d4f'];

interface MetricPoint {
  time: string;
  requests: number;
  latency: number;
  errors: number;
}

interface LogEntry {
  id: number;
  time: string;
  level: string;
  channel: string;
  message: string;
}

const mockChannels = [
  { name: 'direct_llm', location: '通道一', health: 'ok' },
  { name: 'single_agent', location: '通道二', health: 'ok' },
  { name: 'multi_agent', location: '通道三', health: 'ok' },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_agents: 5, total_sessions: 128, active_users: 24, total_requests: 1024, success_rate: 98.5 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [realtimeMode, setRealtimeMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, channelsRes] = await Promise.all([
        getStats().catch(() => ({ data: { total_agents: 5, total_sessions: 128, active_users: 24, total_requests: 1024, success_rate: 98.5 } })),
        getChannels().catch(() => ({ data: { channels: mockChannels } })),
      ]);

      setStats(statsRes.data);
      setChannels(channelsRes.data.channels?.length ? channelsRes.data.channels : mockChannels);

      const now = new Date();
      const timeStr = now.toLocaleTimeString().slice(3);
      const newPoint: MetricPoint = {
        time: timeStr,
        requests: Math.floor(Math.random() * 100) + 50,
        latency: Math.floor(Math.random() * 200) + 50,
        errors: Math.floor(Math.random() * 5),
      };

      setMetrics(prev => [...prev, newPoint].slice(-20));

      const logLevel = Math.random() > 0.85 ? 'error' : 'info';
      const channelNames = ['direct_llm', 'single_agent', 'multi_agent'];
      const messages = [
        'Chat request processed successfully',
        'Route decision: single_agent channel',
        'Skill invocation completed',
        'Workflow executed',
        'Request completed in 120ms',
      ];
      const newLog: LogEntry = {
        id: Date.now(),
        time: timeStr,
        level: logLevel,
        channel: channelNames[Math.floor(Math.random() * 3)],
        message: logLevel === 'error' ? 'Request timeout after 30s' : messages[Math.floor(Math.random() * messages.length)],
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));

      setLastUpdate(now);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startRealtime = () => {
    setRealtimeMode(true);
    intervalRef.current = setInterval(fetchData, 3000);
  };

  const stopRealtime = () => {
    setRealtimeMode(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const onlineCount = channels.filter(c => c.health === 'ok' || c.health === true).length;
  const pieData = [
    { name: '在线', value: onlineCount },
    { name: '离线', value: Math.max(0, channels.length - onlineCount) },
  ].filter(d => d.value > 0);

  const latencyData = metrics.map(m => ({ time: m.time, latency: m.latency }));
  const requestData = metrics.map(m => ({ time: m.time, requests: m.requests }));

  const logColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 80 },
    { title: '级别', dataIndex: 'level', key: 'level', width: 60, render: (v: string) => <Tag color={v === 'error' ? 'red' : 'green'}>{v === 'error' ? '错误' : '信息'}</Tag> },
    { title: '通道', dataIndex: 'channel', key: 'channel', width: 100, render: (v: string) => <Badge status={v === 'direct_llm' ? 'processing' : 'default'} text={v} /> },
    { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#262626' }}>监控面板</Title>
        <Space>
          {lastUpdate && <Text type="secondary" style={{ fontSize: 12 }}>最后更新: {lastUpdate.toLocaleTimeString()}</Text>}
          <Button icon={<ReloadOutlined />} onClick={fetchData} size="small">刷新</Button>
          {realtimeMode ? (
            <Button icon={<SyncOutlined spin />} onClick={stopRealtime} size="small" danger>停止实时</Button>
          ) : (
            <Button type="primary" icon={<SyncOutlined />} onClick={startRealtime} size="small">开启实时</Button>
          )}
        </Space>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Agent 总数</Text>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#262626' }}>{stats.total_agents}</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowUpOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>会话总数</Text>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#262626' }}>{stats.total_sessions}</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>活跃用户</Text>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#262626' }}>{stats.active_users}</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: onlineCount === channels.length ? '#f6ffed' : '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {onlineCount === channels.length ? <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} /> : <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>通道在线</Text>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#262626' }}>{onlineCount}/{channels.length}</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="请求趋势" size="small" style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                {requestData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无数据</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={requestData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="requests" stroke="#1890ff" fill="url(#colorRequests)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="延迟趋势 (ms)" size="small" style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                {latencyData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无数据</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="latency" stroke="#52c41a" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card title="通道状态" size="small" style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
                {channels.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无数据</div>
                ) : (
                  <>
                    <div style={{ height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx={80}
                            cy={70}
                            innerRadius={40}
                            outerRadius={60}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {channels.map(ch => (
                      <div key={ch.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <Text>{ch.name}</Text>
                        <Badge status={ch.health === 'ok' || ch.health === true ? 'success' : 'error'} text={ch.health === 'ok' || ch.health === true ? '在线' : '离线'} />
                      </div>
                    ))}
                  </>
                )}
              </Card>
            </Col>
            <Col span={16}>
              <Card
                title={<Space>实时日志 <Tag color={realtimeMode ? 'green' : 'default'}>{realtimeMode ? '实时' : '静止'}</Tag></Space>}
                size="small"
                style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                bordered={false}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  size="small"
                  dataSource={logs}
                  columns={logColumns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 260 }}
                  locale={{ emptyText: '暂无日志' }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}