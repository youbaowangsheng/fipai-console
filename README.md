# FIP.AI Console 工作台

FIP.AI 统一管理控制台，用于监控和配置 fipai-middleware 和 fipai-gateway。

## 功能模块

| 页面 | 路由 | 功能 |
|------|------|------|
| 监控面板 | `/` | 系统统计、通道状态、健康检查 |
| Agent 管理 | `/agents` | 查看和管理 Agent 列表 |
| Skill 列表 | `/skills` | 查看技能列表、支持在线测试 |
| 工作流 | `/workflows` | 查看已配置的工作流 |
| 联系销售 | `/contacts` | 管理联系销售表单提交 |
| 系统设置 | `/settings` | API 连接测试、服务信息 |

## 技术栈

- **前端框架**: React 19 + TypeScript
- **UI 组件**: Ant Design 5
- **图表**: Recharts
- **路由**: React Router DOM 7
- **HTTP 客户端**: Axios

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 目录结构

```
src/
├── components/
│   └── Sidebar.tsx      # 侧边栏导航
├── pages/
│   ├── Dashboard.tsx    # 监控面板
│   ├── Agents.tsx       # Agent 管理
│   ├── Skills.tsx       # Skill 列表
│   ├── Workflows.tsx    # 工作流
│   ├── Contacts.tsx     # 联系销售
│   └── Settings.tsx     # 系统设置
├── types/
│   └── index.ts         # TypeScript 类型定义
└── utils/
    └── api.ts           # API 调用封装
```

## API 依赖

工作台连接 `fipai-middleware` 后端 API：

| 接口 | 描述 |
|------|------|
| `GET /api/dashboard/stats/` | 获取统计数据 |
| `GET /api/channels/channels/` | 获取通道列表 |
| `GET /api/channels/skills/` | 获取技能列表 |
| `POST /api/channels/skills/invoke/` | 调用技能 |
| `GET /api/channels/workflows/` | 获取工作流 |
| `GET /api/agents/` | 获取 Agent 列表 |
| `GET /api/contact/` | 获取联系销售列表 |

## 部署

构建产物部署在 `/var/www/fipai-console/dist/`，通过 nginx 提供服务。

需要配置 DNS 将 `console.fipai.cn` 解析到服务器 IP。