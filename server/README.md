# IIndex 后端

## 技术栈

主要技术：

- Node.js
- Express、express-session
- MySQL
- Sequelize（ORM 框架）
- Redis

依赖库：

- Axios
- NeteaseCloudMusicApi

依赖服务：

- 博天 API

### 为什么选 Node.js 做后端？

1. 相对 Java 启动更快、调试更方便
2. 对前端更友好（IIndex 本身更侧重前端）

## 已支持特性

- 数据库访问
- 全局异常处理
- 全局响应包装
- 全局请求日志记录
- 跨域
- 用户登录及 session 分布式存储

## 快速启动

1）先修改 `src/config` 目录下的配置，可以新建 `config.prod.js` 用于线上环境。

> 你需要保证你的本地已经拥有 mysql，redis 并且创建对应的数据库以及表

比如：

```javascript
// MySQL 配置
dbConfig: {
  database: "IIndex",
  username: "root",
  password: "123456",
  host: "localhost",
  port: 3306,
},
```

2）安装依赖：

```
npm i
```

3）启动服务：

以本地开发环境启动：

```
npm run start:dev
```

以线上环境启动：

```
npm run start
```

## 部署发布

使用腾讯云宝塔工具进行部署上线

## 目录结构

- README.md 项目文档
- db 数据库相关
  - ddl.sql 建表语句
- src 源码
  - config 配置
    - config.js 默认配置
    - config.prod.js 线上配置
  - constant 常量
  - controller 接口层
  - dao 数据访问层
  - exception 异常处理
  - model 数据模型
  - service 业务逻辑
  - thirdpart 第三方依赖
  - utils 工具
  - test 测试
  - db.js 数据库
  - index.js 主文件
  - routes.js 接口注册
  - server.js 后台服务
- Dockerfile 镜像构建
- package.json 项目依赖文件
- yarn.lock 依赖锁定
