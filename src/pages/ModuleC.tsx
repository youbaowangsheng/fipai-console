import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Typography, Progress, Row, Col, Statistic, Modal, Tree } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, NodeIndexOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Workflow {
  id: string;
  name: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
  nodes: number;
  executions: number;
  success_rate: number;
  avg_duration: string;
  status: 'running' | 'idle' | 'error';
  last_run: string;
}

export default function ModuleC() {
  const [workflows] = useState<Workflow[]>([
    { id: '1', name: '供需分析流程', type: 'sequential', nodes: 4, executions: 1234, success_rate: 97, avg_duration: '2.3s', status: 'running', last_run: '2024-05-20 10:30:00' },
    { id: '2', name: '并行匹配流程', type: 'parallel', nodes: 6, executions: 856, success_rate: 94, avg_duration: '1.8s', status: 'running', last_run: '2024-05-20 10:29:30' },
    { id: '3', name: '条件分支流程', type: 'conditional', nodes: 5, executions: 432, success_rate: 91, avg_duration: '3.1s', status: 'idle', last_run: '2024-05-20 09:15:00' },
    { id: '4', name: '混合编排流程', type: 'hybrid', nodes: 8, executions: 234, success_rate: 89, avg_duration: '4.5s', status: 'idle', last_run: '2024-05-19 18:00:00' },
  ]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const typeMap = {
    sequential: { label: '顺序', color: 'blue' },
    parallel: { label: '并行', color: 'green' },
    conditional: { label: '条件分支', color: 'orange' },
    hybrid: { label: '混合模式', color: 'purple' },
  };

  const statusMap = {
    running: { label: '运行中', color: 'processing' },
    idle: { label: '空闲', color: 'default' },
    error: { label: '错误', color: 'error' },
  };

  const columns = [
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s: keyof typeof statusMap) => <Tag color={statusMap[s].color}>{statusMap[s].label}</Tag> },
    { title: '工作流名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t: keyof typeof typeMap) => <Tag color={typeMap[t].color}>{typeMap[t].label}</Tag> },
    { title: '节点数', dataIndex: 'nodes', key: 'nodes', width: 80 },
    { title: '执行次数', dataIndex: 'executions', key: 'executions', width: 100 },
    {
      title: '成功率',
      dataIndex: 'success_rate',
      key: 'success_rate',
      width: 120,
      render: (rate: number) => <Progress percent={rate} size="small" status={rate > 95 ? 'success' : 'normal'} />,
    },
    { title: '平均耗时', dataIndex: 'avg_duration', key: 'avg_duration', width: 100 },
    { title: '最后执行', dataIndex: 'last_run', key: 'last_run', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Workflow) => (
        <Space>
          <Button size="small" type="link" icon={<NodeIndexOutlined />} onClick={() => setSelectedWorkflow(record)}>
            详情
          </Button>
          {record.status === 'running' ? (
            <Button size="small" type="link" danger icon={<PauseCircleOutlined />}>暂停</Button>
          ) : (
            <Button size="small" type="link" icon={<PlayCircleOutlined />}>执行</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Module C - 协作编排</Title>
          <Text type="secondary">顺序/并行/条件分支/混合模式工作流管理</Text>
        </div>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="运行中" value={workflows.filter(w => w.status === 'running').length} /></Card></Col>
        <Col span={6}><Card><Statistic title="空闲" value={workflows.filter(w => w.status === 'idle').length} /></Card></Col>
        <Col span={6}><Card><Statistic title="今日执行" value={workflows.reduce((sum, w) => sum + w.executions, 0)} /></Card></Col>
        <Col span={6}><Card><Statistic title="平均成功率" value={`${Math.round(workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length)}%`} /></Card></Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Table dataSource={workflows} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title={`工作流详情: ${selectedWorkflow?.name}`}
        open={!!selectedWorkflow}
        onCancel={() => setSelectedWorkflow(null)}
        footer={null}
        width={700}
      >
        {selectedWorkflow && (
          <div>
            <Row gutter={16}>
              <Col span={12}><Statistic title="类型" value={typeMap[selectedWorkflow.type].label} /></Col>
              <Col span={12}><Statistic title="节点数" value={selectedWorkflow.nodes} /></Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text strong>节点结构：</Text>
              <Tree
                defaultExpandAll
                treeData={[
                  { title: '开始节点', key: 'start' },
                  { title: 'LLM调用节点', key: 'llm' },
                  ...(selectedWorkflow.type === 'parallel' ? [
                    { title: '并行分支A', key: 'pa', children: [{ title: '技能A', key: 'skill-a' }, { title: '技能B', key: 'skill-b' }] },
                    { title: '并行分支B', key: 'pb', children: [{ title: '技能C', key: 'skill-c' }] },
                  ] : [
                    { title: '技能节点', key: 'skill' },
                    { title: '判断节点', key: 'condition' },
                  ]),
                  { title: '结束节点', key: 'end' },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}