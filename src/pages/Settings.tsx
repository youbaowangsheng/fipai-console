import { useState } from 'react';
import { Card, Descriptions, Button, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getChannels, getStats } from '../utils/api';

export default function Settings() {
  const [testing, setTesting] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'ok' | 'error' | null>(null);
  const [middlewareStatus, setMiddlewareStatus] = useState<'ok' | 'error' | null>(null);

  const handleTestGateway = () => {
    setTesting(true);
    fetch('http://120.46.41.158:8000/api/v1/health/')
      .then(() => setGatewayStatus('ok'))
      .catch(() => setGatewayStatus('error'))
      .finally(() => setTesting(false));
  };

  const handleTestMiddleware = () => {
    setTesting(true);
    Promise.all([getChannels(), getStats()])
      .then(() => setMiddlewareStatus('ok'))
      .catch(() => setMiddlewareStatus('error'))
      .finally(() => setTesting(false));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>系统设置</h1>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="API 连接测试">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Gateway (8000)">
              <Space>
                <Button onClick={handleTestGateway} loading={testing}>
                  测试连接
                </Button>
                {gatewayStatus === 'ok' && <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>}
                {gatewayStatus === 'error' && <Tag color="error" icon={<CloseCircleOutlined />}>异常</Tag>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Middleware (8001)">
              <Space>
                <Button onClick={handleTestMiddleware} loading={testing}>
                  测试连接
                </Button>
                {middlewareStatus === 'ok' && <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>}
                {middlewareStatus === 'error' && <Tag color="error" icon={<CloseCircleOutlined />}>异常</Tag>}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="服务信息">
          <Descriptions column={2}>
            <Descriptions.Item label="Gateway">http://120.46.41.158:8000</Descriptions.Item>
            <Descriptions.Item label="Middleware">http://120.46.41.158:8001</Descriptions.Item>
            <Descriptions.Item label="Website">https://fipai.cn</Descriptions.Item>
            <Descriptions.Item label="Console">https://console.fipai.cn</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="环境信息">
          <Descriptions column={1}>
            <Descriptions.Item label="API Base">http://120.46.41.158:8001/api</Descriptions.Item>
            <Descriptions.Item label="Console 版本">1.0.0</Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}