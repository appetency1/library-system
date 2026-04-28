# 图书馆座位预约系统运行说明

## 环境要求

- Node.js 20 或更高版本
- npm

## 安装依赖

```bash
npm install
```

## 启动开发环境

```bash
npm.cmd run dev
```

该命令会同时启动：

- 前端 Vite：`http://localhost:5173`
- 后端 Express：`http://localhost:3000`

## 单独启动

```bash
npm.cmd run dev:web
npm.cmd run dev:api
```

## 测试与构建

```bash
npm.cmd test
npm.cmd run build
```

## 演示流程

1. 用 `student1` / `Password123!` 登录学生端。
2. 进入“预约座位”，选择阅览室、日期、时间段和可用座位。
3. 在“我的预约”中查看预约，并尝试签到、签退或取消。
4. 退出后用 `admin` / `Admin123!` 登录管理员端。
5. 查看统计看板，进入阅览室、座位、预约、用户和公告管理页面。

## 数据库

后端默认使用 `data/library-seat-reservation.sqlite`。

如需重置演示数据：

1. 停止后端服务。
2. 删除 `data/library-seat-reservation.sqlite`。
3. 重新启动后端。

## 常见问题

PowerShell 提示无法加载 `npm.ps1` 时，改用 `npm.cmd`：

```bash
npm.cmd run dev
```

端口被占用时，可设置环境变量：

```bash
$env:PORT=3001
npm.cmd run dev:api
```
