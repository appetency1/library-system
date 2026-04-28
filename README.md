# 图书馆座位预约系统

计算机专业毕业设计作品：前后端分离的高校图书馆座位预约系统。

## 功能

- 学生注册、登录、查看公告
- 按阅览室、日期、时间段查询座位状态
- 创建预约、取消预约、签到、签退
- 管理员统计看板、阅览室管理、座位管理
- 管理员预约管理、用户管理、公告管理
- SQLite 本地数据库和演示数据自动初始化

## 技术栈

- 前端：Vue 3、Vite、TypeScript、Pinia、Vue Router、Axios、ECharts
- 后端：Node.js、Express、TypeScript、SQLite、JWT、bcryptjs
- 测试：Vitest、Supertest

## 快速运行

```bash
npm install
npm run dev
```

Windows PowerShell 如果提示禁止运行 `npm.ps1`，使用：

```bash
npm.cmd run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 演示账号

- 学生：`student1` / `Password123!`
- 学生：`student2` / `Password123!`
- 管理员：`admin` / `Admin123!`

## 常用命令

```bash
npm.cmd test
npm.cmd run build
npm.cmd run dev:web
npm.cmd run dev:api
```

默认数据库文件为 `data/library-seat-reservation.sqlite`。删除该文件后重新启动后端，会重新初始化演示数据。

## 目录结构

```text
client/                 Vue 前端应用
server/                 Express 后端 API
server/src/domain/      业务规则和服务
server/test/            后端单元与集成测试
docs/                   设计规格、实施计划、运行说明
```
