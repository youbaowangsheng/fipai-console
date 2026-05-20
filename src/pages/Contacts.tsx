import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Empty, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getContacts } from '../utils/api';
import type { Contact } from '../types';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    setLoading(true);
    getContacts().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.contacts || [];
      setContacts(data);
    }).catch(err => {
      console.error('Failed to fetch contacts:', err);
      setContacts([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '公司', dataIndex: 'company', key: 'company', width: 150 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 180 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '需求', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 160 },
    {
      title: '状态',
      dataIndex: 'is_replied',
      key: 'is_replied',
      width: 80,
      render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? '已回复' : '待处理'}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>联系销售</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchContacts}>
          刷新
        </Button>
      </div>

      <Card>
        {loading && contacts.length === 0 ? (
          <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>
        ) : contacts.length === 0 ? (
          <Empty description="暂无联系记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            dataSource={contacts}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
    </div>
  );
}