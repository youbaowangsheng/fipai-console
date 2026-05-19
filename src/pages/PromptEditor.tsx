import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Space, Typography, Divider, Tag, Select,
  Table, message, Modal, Empty, Tabs, Slider, InputNumber
} from 'antd';
import {
  SaveOutlined, PlayCircleOutlined, ThunderboltOutlined, HistoryOutlined,
  BoldOutlined, OrderedListOutlined, PlusOutlined, DeleteOutlined,
  BranchesOutlined, FileTextOutlined
} from '@ant-design/icons';
import { getAgents, invokeSkill } from '../utils/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Variable {
  key: string;
  description: string;
  example: string;
}

interface FewShotExample {
  input: string;
  output: string;
}

interface OutputField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
}

const defaultVariables: Variable[] = [
  { key: 'user_input', description: '用户输入', example: '我想找一份产品经理的工作' },
  { key: 'user_profile', description: '用户Profile', example: '{"name": "张三", "industry": "互联网"}' },
  { key: 'current_time', description: '当前时间', example: '2024-05-20 10:30:00' },
  { key: 'context', description: '上下文信息', example: '来自求职社群的消息' },
];

const defaultSchema: OutputField[] = [
  { name: 'result', type: 'string', description: '分析结果' },
  { name: 'tags', type: 'array', description: '标签列表' },
  { name: 'score', type: 'number', description: '匹配分数 0-1' },
];

export default function PromptEditor() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    '你是一个专业的供需匹配助手。请根据用户输入，分析其需求并提供精准匹配结果。\n\n' +
    '工作流程：\n' +
    '1. 理解用户需求\n' +
    '2. 提取关键标签\n' +
    '3. 进行供需匹配\n' +
    '4. 生成推荐理由\n\n' +
    '输出格式要求：严格按照JSON格式返回。'
  );
  const [customVariables, setCustomVariables] = useState<Variable[]>([]);
  const [variables] = useState<Variable[]>(defaultVariables);
  const [outputSchema, setOutputSchema] = useState<OutputField[]>(defaultSchema);
  const [fewShotExamples, setFewShotExamples] = useState<FewShotExample[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [model, setModel] = useState('deepseek-v3');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<OutputField['type']>('string');

  useEffect(() => {
    loadAgents();
    loadVersionHistory();
  }, []);

  const loadAgents = async () => {
    try {
      const res = await getAgents();
      if (res.data?.results) {
        setAgents(res.data.results);
      } else if (Array.isArray(res.data)) {
        setAgents(res.data);
      }
    } catch (e) {
      console.error('Failed to load agents', e);
    }
  };

  const loadVersionHistory = () => {
    // 模拟版本历史
    setVersionHistory([
      { version: 'v2', time: '2024-05-20 10:30:00', desc: '优化匹配逻辑' },
      { version: 'v1', time: '2024-05-19 15:20:00', desc: '初始版本' },
    ]);
  };

  const insertVariable = (varKey: string) => {
    setSystemPrompt(prev => prev + `{${varKey}}`);
  };

  const applyFormat = (format: 'bold' | 'list' | 'quote') => {
    const markers = {
      bold: ['**', '**'],
      list: ['\n- ', ''],
      quote: ['\n> ', ''],
    };
    const [prefix, suffix] = markers[format];
    setSystemPrompt(prev => prev + prefix + '文本' + suffix);
  };

  const handleSave = () => {
    message.success('Prompt 配置已保存');
    // 保存到服务器
    const config = {
      agent_id: selectedAgent,
      system_prompt: systemPrompt,
      variables: [...variables, ...customVariables],
      output_schema: outputSchema,
      few_shot_examples: fewShotExamples,
      temperature,
      max_tokens: maxTokens,
      model,
    };
    console.log('Saving config:', config);
    // TODO: 调用 API 保存
  };

  const handleTest = async () => {
    if (!testInput.trim()) {
      message.warning('请输入测试内容');
      return;
    }
    setTestLoading(true);
    setTestOutput(null);
    try {
      // 使用 skill invoke 来测试 prompt
      const res = await invokeSkill('text_analysis', {
        text: testInput,
        prompt: systemPrompt,
        schema: outputSchema,
      });
      setTestOutput(res.data);
      message.success('测试完成');
    } catch (e: any) {
      message.error('测试失败: ' + (e.message || '未知错误'));
      // 模拟输出用于演示
      setTestOutput({
        result: '模拟分析结果：根据输入匹配到3条供需记录',
        tags: ['产品经理', '互联网', '求职'],
        score: 0.85,
      });
    }
    setTestLoading(false);
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      // 模拟 AI 优化
      await new Promise(resolve => setTimeout(resolve, 2000));
      const optimizedPrompt = systemPrompt +
        '\n\n[优化建议] 请确保在输出前进行充分的供需验证，避免推荐不相关的匹配结果。';
      setSystemPrompt(optimizedPrompt);
      message.success('Prompt 优化完成');
    } catch (e) {
      message.error('优化失败');
    }
    setOptimizing(false);
    setOptimizeModalOpen(false);
  };

  const addOutputField = () => {
    if (!newFieldName.trim()) return;
    setOutputSchema(prev => [...prev, { name: newFieldName, type: newFieldType }]);
    setNewFieldName('');
    setSchemaModalOpen(false);
  };

  const removeOutputField = (name: string) => {
    setOutputSchema(prev => prev.filter(f => f.name !== name));
  };

  const addFewShotExample = () => {
    setFewShotExamples(prev => [...prev, { input: '', output: '' }]);
  };

  const updateFewShotExample = (index: number, field: 'input' | 'output', value: string) => {
    setFewShotExamples(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeFewShotExample = (index: number) => {
    setFewShotExamples(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomVariable = () => {
    const key = `custom_${Date.now()}`;
    setCustomVariables(prev => [...prev, { key, description: '自定义变量', example: '' }]);
  };

  const removeCustomVariable = (index: number) => {
    setCustomVariables(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: 24, background: "#fffaf5" }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Prompt 模板编辑器</Title>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => setHistoryOpen(true)}>版本历史</Button>
          <Button icon={<ThunderboltOutlined />} onClick={() => setOptimizeModalOpen(true)} type="primary">
            Prompt 优化助手
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存配置</Button>
        </Space>
      </div>

      {/* Agent 选择 */}
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Space size="large">
          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>绑定 Agent</Text>
            <Select
              placeholder="选择 Agent（可选）"
              style={{ width: 300 }}
              value={selectedAgent}
              onChange={setSelectedAgent}
              allowClear
            >
              {agents.map(agent => (
                <Select.Option key={agent.id} value={agent.id}>{agent.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>模型</Text>
            <Select value={model} onChange={setModel} style={{ width: 150 }}>
              <Select.Option value="deepseek-v3">DeepSeek V3</Select.Option>
              <Select.Option value="gpt-4o-mini">GPT-4o Mini</Select.Option>
              <Select.Option value="qwen-plus">Qwen Plus</Select.Option>
            </Select>
          </div>
          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>温度: {temperature.toFixed(1)}</Text>
            <Slider value={temperature} onChange={setTemperature} min={0} max={1} step={0.1} style={{ width: 120 }} />
          </div>
          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>最大Token</Text>
            <InputNumber value={maxTokens} onChange={v => setMaxTokens(v || 2048)} min={100} max={128000} style={{ width: 100 }} />
          </div>
        </Space>
      </Card>

      <Tabs
        defaultActiveKey="editor"
        items={[
          {
            key: 'editor',
            label: <span><FileTextOutlined /> System Prompt</span>,
            children: (
              <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* 左侧: 编辑器 */}
                  <div style={{ flex: 1 }}>
                    <Space style={{ marginBottom: 12 }}>
                      <Text type="secondary">工具栏：</Text>
                      <Button size="small" icon={<BoldOutlined />} onClick={() => applyFormat('bold')}>加粗</Button>
                      <Button size="small" icon={<OrderedListOutlined />} onClick={() => applyFormat('list')}>列表</Button>
                      <Button size="small" icon={<FileTextOutlined />} onClick={() => applyFormat('quote')}>引用</Button>
                    </Space>
                    <TextArea
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      rows={16}
                      style={{ fontFamily: 'monospace', fontSize: 14 }}
                      placeholder="输入 System Prompt，使用 {变量名} 插入变量..."
                    />
                  </div>

                  {/* 右侧: 变量插入 */}
                  <div style={{ width: 280 }}>
                    <Card
                      size="small"
                      title="插入变量"
                      extra={<Button size="small" type="link" icon={<PlusOutlined />} onClick={addCustomVariable}>自定义</Button>}
                      styles={{ body: { padding: 12 } }}
                    >
                      {variables.map(v => (
                        <Tag
                          key={v.key}
                          style={{ marginBottom: 8, cursor: 'pointer', padding: '4px 8px' }}
                          onClick={() => insertVariable(v.key)}
                          title={`示例: ${v.example}`}
                          color="blue"
                        >
                          {`{${v.key}}`} - {v.description}
                        </Tag>
                      ))}
                      {customVariables.map((v, i) => (
                        <Tag
                          key={v.key}
                          style={{ marginBottom: 8, cursor: 'pointer' }}
                          onClick={() => insertVariable(v.key)}
                          closable
                          onClose={() => removeCustomVariable(i)}
                          color="purple"
                        >
                          {`{${v.key}}`} - {v.description}
                        </Tag>
                      ))}
                    </Card>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            key: 'output',
            label: <span><BranchesOutlined /> 输出格式</span>,
            children: (
              <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text strong>JSON Schema 定义</Text>
                  <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setSchemaModalOpen(true)}>
                    添加字段
                  </Button>
                </div>
                <Table
                  dataSource={outputSchema}
                  rowKey="name"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '字段名', dataIndex: 'name', key: 'name' },
                    { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="geekblue">{t}</Tag> },
                    { title: '描述', dataIndex: 'description', key: 'description' },
                    {
                      title: '操作',
                      key: 'action',
                      width: 80,
                      render: (_, record) => (
                        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeOutputField(record.name)} />
                      ),
                    },
                  ]}
                />
                <Divider />
                <Text strong style={{ marginBottom: 8, display: 'block' }}>输出预览</Text>
                <pre style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 8,
                  fontSize: 12,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(
                    outputSchema.reduce((acc: Record<string, any>, f) => {
                      acc[f.name] = f.type === 'array' ? [] : f.type === 'number' ? 0 : f.type === 'boolean' ? false : '';
                      return acc;
                    }, {}),
                    null,
                    2
                  )}
                </pre>
              </Card>
            ),
          },
          {
            key: 'fewshot',
            label: <span><OrderedListOutlined /> Few-shot 示例</span>,
            children: (
              <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <Text strong>示例对（可选）</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>帮助 LLM 理解期望的输入输出格式</Text>
                  </div>
                  <Button size="small" type="primary" icon={<PlusOutlined />} onClick={addFewShotExample}>
                    添加示例
                  </Button>
                </div>
                {fewShotExamples.length === 0 ? (
                  <Empty description="暂无示例，点击上方按钮添加" />
                ) : (
                  fewShotExamples.map((ex, i) => (
                    <Card key={i} size="small" style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>输入</Text>
                          <Input.TextArea
                            value={ex.input}
                            onChange={e => updateFewShotExample(i, 'input', e.target.value)}
                            rows={2}
                            placeholder="示例输入..."
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>输出</Text>
                          <Input.TextArea
                            value={ex.output}
                            onChange={e => updateFewShotExample(i, 'output', e.target.value)}
                            rows={2}
                            placeholder="示例输出..."
                          />
                        </div>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFewShotExample(i)} />
                      </div>
                    </Card>
                  ))
                )}
              </Card>
            ),
          },
          {
            key: 'test',
            label: <span><PlayCircleOutlined /> 测试面板</span>,
            children: (
              <Card>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>输入测试内容</Text>
                    <Input.TextArea
                      value={testInput}
                      onChange={e => setTestInput(e.target.value)}
                      rows={8}
                      placeholder="输入你想测试的内容..."
                    />
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      loading={testLoading}
                      onClick={handleTest}
                      style={{ marginTop: 16 }}
                    >
                      执行测试
                    </Button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>原始输出</Text>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                      minHeight: 180,
                      fontSize: 12,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}>
                      {testOutput ? JSON.stringify(testOutput, null, 2) : '点击"执行测试"查看结果'}
                    </pre>
                    <Text strong style={{ marginTop: 16, marginBottom: 8, display: 'block' }}>解析后输出</Text>
                    <pre style={{
                      background: '#f6ffed',
                      padding: 16,
                      borderRadius: 8,
                      minHeight: 60,
                      fontSize: 12,
                      overflow: 'auto'
                    }}>
                      {testOutput ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {outputSchema.map(field => (
                              <tr key={field.name}>
                                <td style={{ padding: '4px 8px', borderBottom: '1px solid #e8e8e8', fontWeight: 500 }}>
                                  {field.name}:
                                </td>
                                <td style={{ padding: '4px 8px', borderBottom: '1px solid #e8e8e8' }}>
                                  {Array.isArray(testOutput[field.name])
                                    ? testOutput[field.name].join(', ')
                                    : typeof testOutput[field.name] === 'object'
                                      ? JSON.stringify(testOutput[field.name])
                                      : String(testOutput[field.name] ?? '-')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : '-'}
                    </pre>
                  </div>
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* Prompt 优化弹窗 */}
      <Modal
        title="Prompt 优化助手"
        open={optimizeModalOpen}
        onOk={handleOptimize}
        onCancel={() => setOptimizeModalOpen(false)}
        confirmLoading={optimizing}
        okText="开始优化"
      >
        <p>AI 将分析当前的 Prompt，并提供优化建议。</p>
        <Card size="small" style={{ marginTop: 16, background: '#f5f5f5' }}>
          <Text type="secondary">当前 Prompt 预览：</Text>
          <div style={{ marginTop: 8, maxHeight: 150, overflow: 'auto', fontSize: 12 }}>
            {systemPrompt.slice(0, 500)}{systemPrompt.length > 500 ? '...' : ''}
          </div>
        </Card>
      </Modal>

      {/* 添加输出字段弹窗 */}
      <Modal
        title="添加字段"
        open={schemaModalOpen}
        onOk={addOutputField}
        onCancel={() => setSchemaModalOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item label="字段名" required>
            <Input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="如: tags" />
          </Form.Item>
          <Form.Item label="类型" required>
            <Select value={newFieldType} onChange={v => setNewFieldType(v)}>
              <Select.Option value="string">string</Select.Option>
              <Select.Option value="number">number</Select.Option>
              <Select.Option value="boolean">boolean</Select.Option>
              <Select.Option value="array">array</Select.Option>
              <Select.Option value="object">object</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本历史弹窗 */}
      <Modal
        title="版本历史"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={null}
        width={500}
      >
        <Table
          dataSource={versionHistory}
          rowKey="version"
          pagination={false}
          size="small"
          columns={[
            { title: '版本', dataIndex: 'version', key: 'version' },
            { title: '时间', dataIndex: 'time', key: 'time' },
            { title: '描述', dataIndex: 'desc', key: 'desc' },
            {
              title: '操作',
              key: 'action',
              render: () => <Button size="small" type="link">回滚</Button>,
            },
          ]}
        />
      </Modal>
    </div>
  );
}