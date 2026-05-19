# FIP.AI Console 管理平台

**访问地址**: https://console.fipai.cn

---

## 功能模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 监控面板 | `/` | 系统状态、趋势图、日志 |
| Agent 管理 | `/agents` | Agent 列表、详情、创建 |
| Prompt 编辑器 | `/prompt-editor` | AI Prompt 编写和测试 |
| Skill 列表 | `/skills` | 技能管理、测试调用 |
| 工作流 | `/workflows` | 工作流列表、详情 |
| 通道路由 | `/channels` | 三通道权重配置 |
| API 测试 | `/api-test` | Gateway API 测试工具 |
| 用户权限 | `/auth` | 用户管理、操作日志 |
| 模型配置 | `/system` | AI 模型配置 |
| 系统设置 | `/settings` | 系统设置 |

---

## 快速开始

### 1. 登录

访问 https://console.fipai.cn ，使用账号密码登录。

**测试账号**:
- 邮箱: `test2@fipai.cn`
- 密码: `Test123456`

### 2. 创建 Agent

1. 进入 **Agent 管理** 页面
2. 点击 **新建 Agent** 按钮
3. 填写 Agent 配置信息
4. 保存完成

### 3. 配置通道路由

1. 进入 **通道路由** 页面
2. 选择快速策略或手动调整权重
3. 总权重需等于 100%

---

## 技术架构

### 前端

- **框架**: React + TypeScript + Vite
- **UI**: Ant Design 5
- **图表**: Recharts

### 后端 API

**基础URL**: `https://console.fipai.cn/api`

| 接口 | 方法 | 说明 |
|------|------|------|
| `/auth/login/` | POST | 用户登录 |
| `/auth/register/` | POST | 用户注册 |
| `/auth/userinfo/` | GET | 获取用户信息 |
| `/auth/logout/` | POST | 退出登录 |
| `/dashboard/stats/` | GET | 统计数据 |
| `/channels/channels/` | GET | 通道列表 |
| `/channels/skills/` | GET | 技能列表 |
| `/channels/skills/invoke/` | POST | 调用技能 |
| `/channels/workflows/` | GET | 工作流列表 |

### Gateway API

**基础URL**: `https://console.fipai.cn/api/v1`

| 接口 | 方法 | 说明 |
|------|------|------|
| `/ai/chat-v2/` | POST | 完整AI服务接口 |
| `/chat/` | POST | 统一聊天入口 |
| `/channels/direct_llm/` | POST | 通道一 |
| `/channels/single_agent/` | POST | 通道二 |
| `/channels/multi_agent/` | POST | 通道三 |
| `/health/` | GET | 健康检查 |
| `/channels/` | GET | 通道列表 |
| `/skills/` | GET | 技能列表 |
| `/workflows/` | GET | 工作流列表 |

---

## AI 服务接口

### POST `/ai/chat-v2/` - 完整AI服务接口

```bash
curl -X POST https://console.fipai.cn/api/v1/ai/chat-v2/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "帮我分析AI发展趋势",
    "session_id": "sess_123",
    "channel_hint": "auto",
    "context": {
      "system_prompt": "你是一个专业的AI分析师",
      "tools": ["web_search"]
    }
  }'
```

**响应**:

```json
{
  "content": "根据最新数据显示...",
  "channel": "single_agent",
  "metadata": {
    "model": "deepseek-chat",
    "usage": {...}
  },
  "error": null
}
```

---

## 部署

### 前端构建

```bash
cd fipai-console
npm install
npm run build
```

构建产物在 `dist/` 目录，上传到服务器 `/var/www/fipai-console/`

### Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name console.fipai.cn;
    ssl_certificate /etc/letsencrypt/live/fipai.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fipai.cn/privkey.pem;

    root /var/www/fipai-console;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
    }
}
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_BASE` | `https://console.fipai.cn/api` | API 基础地址 |
| `VITE_GW_BASE` | `https://console.fipai.cn/api/v1` | Gateway 基础地址 |