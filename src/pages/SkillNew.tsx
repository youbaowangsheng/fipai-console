import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Space, Typography, message } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

export default function SkillNew() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Simulate API call - replace with actual API later
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Skill 创建成功');
      navigate('/skills');
    } catch {
      message.error('创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Button onClick={() => navigate('/skills')} disabled={submitting}>返回</Button>
      </div>

      <Card title={<Title level={4} style={{ margin: 0 }}>新建 Skill</Title>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="输入 Skill 名称" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="输入 Skill 描述" />
          </Form.Item>
          <Form.Item label="超时时间(秒)" name="timeout" initialValue={10}>
            <InputNumber min={1} max={60} />
          </Form.Item>
          <Form.Item label="重试次数" name="retry" initialValue={3}>
            <InputNumber min={0} max={5} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>创建</Button>
              <Button onClick={() => navigate('/skills')} disabled={submitting}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}