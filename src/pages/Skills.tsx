import { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, Button, Modal, Input, message, Space, Typography } from 'antd';
import { ReloadOutlined, PlayCircleOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getSkills, invokeSkill } from '../utils/api';
import type { Skill } from '../types';

const { Title } = Typography;

const mockSkills: Skill[] = [
  { name: 'calculator', description: '数学计算 - 支持加减乘除、函数计算', parameters: { type: 'object', properties: { expression: { type: 'string' } } }, timeout: 10, retry: 3 },
  { name: 'weather', description: '天气查询 - 查询指定城市天气信息', parameters: { type: 'object', properties: { city: { type: 'string' } } }, timeout: 10, retry: 3 },
  { name: 'web_search', description: '网络搜索 - 搜索互联网信息', parameters: { type: 'object', properties: { query: { type: 'string' } } }, timeout: 30, retry: 2 },
  { name: 'translation', description: '翻译服务 - 多语言互译', parameters: { type: 'object', properties: { text: { type: 'string' }, to: { type: 'string' } } }, timeout: 15, retry: 3 },
  { name: 'unit_convert', description: '单位转换 - 长度、重量、货币等', parameters: { type: 'object', properties: { value: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } } }, timeout: 10, retry: 2 },
];

const SKILL_PRESETS: Record<string, string> = {
  calculator: '{"expression": "100-20"}',
  weather: '{"city": "北京"}',
  web_search: '{"query": "AI发展趋势"}',
  translation: '{"text": "Hello", "to": "zh"}',
  unit_convert: '{"value": 100, "from": "km", "to": "m"}',
};

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [invokeModalVisible, setInvokeModalVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [invokeResult, setInvokeResult] = useState<any>(null);
  const [invoking, setInvoking] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const navigate = useNavigate();

  const fetchSkills = () => {
    setLoading(true);
    getSkills().then(res => {
      const skillsData = res.data?.skills ?? res.data ?? mockSkills;
      setSkills(Array.isArray(skillsData) ? skillsData : mockSkills);
    }).catch(() => {
      setSkills(mockSkills);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleInvoke = () => {
    if (!selectedSkill || !skillInput) return;
    setInvoking(true);
    let inputData: any;
    try {
      inputData = JSON.parse(skillInput);
    } catch {
      message.error('请输入有效的 JSON 格式');
      setInvoking(false);
      return;
    }
    invokeSkill(selectedSkill.name, inputData).then(res => {
      setInvokeResult(res.data);
      message.success('执行成功');
    }).catch(err => {
      setInvokeResult({ error: err.response?.data?.error || err.message });
      message.error('执行失败');
    }).finally(() => setInvoking(false));
  };

  const openInvokeModal = (skill: Skill) => {
    setSelectedSkill(skill);
    setInvokeResult(null);
    const preset = SKILL_PRESETS[skill.name];
    setSkillInput(preset || '{}');
    setInvokeModalVisible(true);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (name: string) => <Space><ThunderboltOutlined style={{ color: '#faad14' }} />{name}</Space>,
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '超时', dataIndex: 'timeout', key: 'timeout', width: 70, render: (t: number) => <Tag>{t}s</Tag> },
    { title: '重试', dataIndex: 'retry', key: 'retry', width: 70, render: (r: number) => <Tag color="blue">{r}次</Tag> },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Skill) => (
        <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => openInvokeModal(record)}>
          测试
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fffaf5" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#262626' }}>Skill 列表</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSkills} size="small">刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/skills/new')} size="small">新建 Skill</Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} bordered={false}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
        ) : (
          <Table
            dataSource={skills}
            columns={columns}
            rowKey="name"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }}
          />
        )}
      </Card>

      <Modal
        title={<Space><ThunderboltOutlined /> 测试 Skill: <Tag color="gold">{selectedSkill?.name}</Tag></Space>}
        open={invokeModalVisible}
        onOk={handleInvoke}
        onCancel={() => { setInvokeModalVisible(false); setInvokeResult(null); }}
        width={600}
        okText="执行"
        confirmLoading={invoking}
      >
        <div style={{ marginBottom: 16 }}>
          <p><strong>描述:</strong> {selectedSkill?.description}</p>
          <p><strong>参数:</strong> <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{JSON.stringify(selectedSkill?.parameters)}</code></p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>输入 (JSON):</label>
          <Input.TextArea
            rows={4}
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            placeholder='{"key": "value"}'
            style={{ borderRadius: 8 }}
          />
        </div>
        {invokeResult && (
          <div style={{
            background: invokeResult.error ? '#fff2f0' : '#f6ffed',
            padding: 16,
            borderRadius: 8,
            border: `1px solid ${invokeResult.error ? '#ffccc7' : '#b7eb8f'}`
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(invokeResult, null, 2)}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
}