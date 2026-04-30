# 图书馆座位预约系统运行说明

本文档用于本地运行、答辩演示和问题排查。

## 环境要求

- Node.js 20 或更高版本
- npm
- Windows PowerShell、CMD、Git Bash 或其他终端

## 安装依赖

在项目根目录执行：

```bash
npm install
```

## 启动开发环境

Windows 环境推荐使用：

```bash
npm.cmd run dev
```

其他环境可使用：

```bash
npm run dev
```

该命令会同时启动：

- 前端 Vite：http://localhost:5173
- 后端 Express：http://localhost:3000

## 单独启动

只启动前端：

```bash
npm.cmd run dev:web
```

只启动后端：

```bash
npm.cmd run dev:api
```

## 测试与构建

运行测试：

```bash
npm.cmd test
```

构建前端和后端：

```bash
npm.cmd run build
```

## 默认账号

| 角色 | 账号 | 密码 | 说明 |
| --- | --- | --- | --- |
| 学生 | `student1` | `Password123!` | 用于演示预约、取消、签到和签退 |
| 学生 | `student2` | `Password123!` | 用于演示多用户场景 |
| 管理员 | `admin` | `Admin123!` | 用于演示后台管理功能 |

## 演示流程

1. 使用 `student1` / `Password123!` 登录学生端。
2. 进入“预约座位”，选择阅览室、日期、时间段和可用座位。
3. 提交预约后进入“我的预约”，查看预约记录。
4. 在允许操作的时间范围内演示取消、签到或签退。
5. 退出学生端，使用 `admin` / `Admin123!` 登录管理端。
6. 查看统计看板，进入阅览室、座位、预约、用户和公告管理页面。
7. 在预约管理中按状态、日期或关键词筛选记录，并演示异常预约处理。

## 数据库说明

后端默认使用 SQLite，数据库文件路径为：

```text
data/library-seat-reservation.sqlite
```

首次启动后端时，系统会自动初始化：

- 默认学生和管理员账号
- 两个阅览室
- 每个阅览室 8 个座位
- 两条系统公告

如需重置演示数据：

1. 停止后端服务。
2. 删除 `data/library-seat-reservation.sqlite`。
3. 重新启动后端服务。

注意：删除数据库会清空本地注册用户、预约记录和管理端新增数据。

## 截图说明

答辩材料建议至少包含以下截图：

- 登录页：说明系统入口和账号角色
- 学生首页：说明公告、当前预约和快捷入口
- 座位预约页：说明按阅览室、日期、时间段选择座位
- 我的预约页：说明预约记录、状态筛选和操作按钮
- 管理员统计看板：说明统计指标和预约趋势
- 阅览室管理页：说明阅览室基础数据维护
- 座位管理页：说明座位启用、停用和编辑
- 预约管理页：说明管理员查看和处理预约
- 公告管理页：说明系统公告发布流程

截图可以统一保存到 `docs/screenshots/`，文件名建议使用 `01-login.png`、`02-student-dashboard.png`、`03-seat-reservation.png` 等格式，便于在论文和 PPT 中引用。

## 常见问题

### PowerShell 无法运行 npm.ps1

如果 PowerShell 提示无法加载 `npm.ps1`，可改用：

```bash
npm.cmd run dev
```

### 端口被占用

如果后端端口被占用，可临时指定新端口：

```bash
$env:PORT=3001
npm.cmd run dev:api
```

前端默认会请求 `http://localhost:3000`。如果后端端口变更，需要同步调整前端接口地址配置。
