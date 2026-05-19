import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Select, Button, Space, Typography, Divider,
  Table, Tag, Switch, message, Modal, InputNumber, Radio,
  Empty, Alert
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, ThunderboltOutlined, PlusOutlined,
  DeleteOutlined, EditOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { getAgents } from '../utils/api';

const { Title, Text } = Typography;

interface Trigger {
  id: string;
  name: string;
  type: 'user' | 'scheduled' | 'event';
  enabled: boolean;
  agent_id?: string;
  agent_name?: string;
  config: any;
  last_run?: string;
  next_run?: string;
  status: 'idle' | 'running' | 'error';
}

const triggerTypeConfig = {
  user: {
    label: '用户主动触发',
    icon: <UserOutlined />,
    color: 'blue',
    desc: '用户在App内点击/输入触发',
  },
  scheduled: {
    label: '定时触发',
    icon: <ClockCircleOutlined />,
    color: 'green',
    desc: '按Cron表达式定时执行',
  },
  event: {
    label: '事件触发',
    icon: <ThunderboltOutlined />,
    color: 'purple',
    desc: '当某个事件发生时触发',
  },
};

const cronPresets = [
  { label: '每小时', value: '0 * * * *' },
  { label: '每天早9点', value: '0 9 * * *' },
  { label: '每天晚6点', value: '0 18 * * *' },
  { label: '每周一', value: '0 9 * * 1' },
  { label: '每月1号', value: '0 9 1 * *' },
];

const eventTypes = [
  { value: 'user_register', label: '新用户注册' },
  { value: 'supply_publish', label: '供需发布' },
  { value: 'demand_publish', label: '需求发布' },
  { value: 'message_received', label: '收到消息' },
  { value: 'match_found', label: '匹配成功' },
];

export default function TriggerConfig() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const agentsRes = await getAgents().catch(() => ({ data: [] }));
      setAgents(agentsRes.data?.results || agentsRes.data || []);

      // 模拟触发器数据
      setTriggers([
        {
          id: '1',
          name: '每日早报',
          type: 'scheduled',
          enabled: true,
          agent_id: '1',
          agent_name: '早报助手',
          config: { cron: '0 9 * * *', data_range: '24h' },
          last_run: '2024-05-20 09:00:00',
          next_run: '2024-05-21 09:00:00',
          status: 'idle',
        },
        {
          id: '2',
          name: '新用户欢迎',
          type: 'event',
          enabled: true,
          agent_id: '2',
          agent_name: '欢迎助手',
          config: { event_type: 'user_register', delay: 0 },
          status: 'idle',
        },
        {
          id: '3',
          name: '供需自动匹配',
          type: 'event',
          enabled: false,
          agent_id: '3',
          agent_name: '匹配助手',
          config: { event_type: 'supply_publish', conditions: {} },
          status: 'idle',
        },
      ]);
    } catch (e) {
      console.error('Failed to load data', e);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingTrigger(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    form.setFieldsValue({
      name: trigger.name,
      type: trigger.type,
      agent_id: trigger.agent_id,
      enabled: trigger.enabled,
      cron: trigger.config?.cron,
      data_range: trigger.config?.data_range || 24,
      event_type: trigger.config?.event_type,
      delay: trigger.config?.delay || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个触发配置吗？',
      onOk: () => {
        setTriggers(prev => prev.filter(t => t.id !== id));
        message.success('已删除');
      },
    });
  };

  const handleToggle = (trigger: Trigger) => {
    setTriggers(prev => prev.map(t =>
      t.id === trigger.id ? { ...t, enabled: !t.enabled } : t
    ));
    message.success(`已${trigger.enabled ? '禁用' : '启用'}`);
  };

  const handleSubmit = (values: any) => {
    const agent = agents.find(a => a.id === values.agent_id);
    const triggerData: Trigger = {
      id: editingTrigger?.id || Date.now().toString(),
      name: values.name,
      type: values.type,
      enabled: values.enabled ?? true,
      agent_id: values.agent_id,
      agent_name: agent?.name,
      config: values.type === 'scheduled'
        ? { cron: values.cron, data_range: values.data_range }
        : values.type === 'event'
          ? { event_type: values.event_type, delay: values.delay }
          : {},
      status: 'idle',
    };

    if (editingTrigger) {
      setTriggers(prev => prev.map(t => t.id === editingTrigger.id ? triggerData : t));
      message.success('触发配置已更新');
    } else {
      setTriggers(prev => [...prev, triggerData]);
      message.success('触发配置已创建');
    }
    setModalOpen(false);
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: Trigger) => (
        <Switch checked={enabled} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: keyof typeof triggerTypeConfig) => {
        const config = triggerTypeConfig[type];
        return <Tag icon={config.icon} color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '绑定Agent',
      dataIndex: 'agent_name',
      key: 'agent_name',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '配置详情',
      dataIndex: 'config',
      key: 'config',
      render: (config: any, record: Trigger) => {
        if (record.type === 'scheduled') {
          return <Text code>{config.cron}</Text>;
        }
        if (record.type === 'event') {
          const event = eventTypes.find(e => e.value === config.event_type);
          return <Text>{event?.label || config.event_type}</Text>;
        }
        return '-';
      },
    },
    {
      title: '下次执行',
      dataIndex: 'next_run',
      key: 'next_run',
      width: 160,
      render: (v: string) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          idle: { color: 'default', text: '空闲' },
          running: { color: 'processing', text: '运行中' },
          error: { color: 'error', text: '错误' },
        };
        return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Trigger) => (
        <Space>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="small" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5" }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>触发条件配置</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建触发
        </Button>
      </div>

      {/* 说明 */}
      <Alert
        message="触发配置说明"
        description="触发条件告诉 Agent '什么时候应该工作'。用户主动触发由用户在App内操作，定时触发按Cron表达式执行，事件触发当指定事件发生时自动执行。"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* 触发器列表 */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={triggers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="暂无触发配置，点击右上角新建" /> }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingTrigger ? '编辑触发配置' : '新建触发配置'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ enabled: true }}>
          <Form.Item label="触发名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：每日早报、新用户欢迎" />
          </Form.Item>

          <Form.Item label="触发类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group>
              {(Object.keys(triggerTypeConfig) as Array<keyof typeof triggerTypeConfig>).map(key => (
                <Radio.Button key={key} value={key}>
                  <Space>
                    {triggerTypeConfig[key].icon}
                    {triggerTypeConfig[key].label}
                  </Space>
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="绑定Agent" name="agent_id" rules={[{ required: true, message: '请选择Agent' }]}>
            <Select placeholder="选择要触发的Agent">
              {agents.map(agent => (
                <Select.Option key={agent.id} value={agent.id}>{agent.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 定时触发配置 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => getFieldValue('type') === 'scheduled' && (
              <>
                <Divider>Cron 配置</Divider>
                <Form.Item label="快速选择" name="cron_preset">
                  <Select placeholder="选择预设或自定义" allowClear>
                    {cronPresets.map(p => (
                      <Select.Option key={p.value} value={p.value}>
                        {p.label} ({p.value})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="自定义 Cron 表达式" name="cron" rules={[{ required: true, message: '请输入Cron表达式' }]}>
                  <Input placeholder="0 * * * * (分 时 日 月 周)" />
                </Form.Item>
                <Form.Item label="数据范围（小时）" name="data_range" tooltip="每次执行时分析过去多少小时的数据">
                  <InputNumber min={1} max={168} defaultValue={24} style={{ width: 200 }} />
                </Form.Item>
              </>
            )}
          </Form.Item>

          {/* 事件触发配置 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => getFieldValue('type') === 'event' && (
              <>
                <Divider>事件配置</Divider>
                <Form.Item label="事件类型" name="event_type" rules={[{ required: true, message: '请选择事件类型' }]}>
                  <Select placeholder="选择触发事件">
                    {eventTypes.map(e => (
                      <Select.Option key={e.value} value={e.value}>{e.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="延迟执行（秒）" name="delay" tooltip="事件发生后延迟多少秒执行，0表示立即执行">
                  <InputNumber min={0} max={3600} defaultValue={0} style={{ width: 200 }} />
                </Form.Item>
              </>
            )}
          </Form.Item>

          <Form.Item label="启用状态" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTrigger ? '保存修改' : '创建'}
              </Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}