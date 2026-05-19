import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function AgentNew() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    message.success('Agent 创建功能待开发');
    navigate('/agents');
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/agents')}>
          返回
        </Button>
      </div>

      <Card title={<Title level={4} style={{ margin: 0 }}>新建 Agent</Title>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="输入 Agent 名称" />
          </Form.Item>
          <Form.Item label="类型" name="agent_type" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="选择 Agent 类型">
              <Select.Option value="recommendation">推荐类</Select.Option>
              <Select.Option value="customer_service">客服类</Select.Option>
              <Select.Option value="analytics">分析类</Select.Option>
              <Select.Option value="moderation">审核类</Select.Option>
              <Select.Option value="productivity">效率类</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} placeholder="输入 Agent 描述" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">创建</Button>
              <Button onClick={() => navigate('/agents')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}