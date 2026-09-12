# word
nest.js 单词后台管理系统和h5应用开发

## 应用形式

- 后台管理系统
- h5应用
- 多端开发

## 亮点

- 数据清洗
    - github 高星的单词资料库，数据清洗(选择、格式化、审核)
- supabase 云端psql数据库
    - 既可以做关系型数据库，也支持向量数据库
    - 云端 BASS(Backend as a service)数据库
- ORM
    - 对象关系映射
    - 不用写SQL,不用做数据库的底层处理
    - todo.save() 保存，将对象和数据库一行记录对应起来

## 后台管理系统

### 单词书管理

维护单词书，包括单词书的创建、删除、更新、查询等操作。
单词书的维护交给小编管理员

### 管理员管理

- 注册一个超级管理员，一个人
- 添加管理员，

访问/ -> 注册超级管理员页面 -> 登陆
已经有超级管理员，访问/ -> 登陆页面 -> 跳转到单词书管理页面

## shadcn/ui UI组件库

- 80%前端组件业务趋同，不用重复造轮子，可以选用第三方组件库。
- element-ui / ANT Design 这些的缺点是不够灵活
- shadcn 定制性很好
    - tailwindcss 配合使用
    - 语义化，对AI友好
    - 按需加载
    - 目录在 components/ui 目录下

## supabase

BASS 数据库云服务
性能、安全、可扩展性、部署成本几乎为0
- psql 支持embedding + 关系数据库

**Conventional Commits(约定式提交)**规范，也是目前主流的git提交信息风格。
- feat新增功能
- fix修复bug
- docs文档变更
- refactor代码重构
- perf性能优化
- test测试变更
- chore构建工具变更

coding agent 内置的git提交

## ORM

- 数据库supabase已经云端创建
    - .env DATABASE_URL
- next.js 面向对象编程  O Object 高级
    - 不同国家的人
    - User  user.save() -> sql insert into
    - drizzle orm 映射 翻译
    - psql User Table 低级 sql
- drizzle 接手数据库 .env
    - 不需要建表，建立schema,映射的就是数据表。
    - migrate 数据表迁移

## drizzle

ORM 工具的一种，有一系列的包和命令

- db目录
    - index.ts 数据库配置、链接并返回db数据库操作句柄。
    - schema.ts 对象定义数据表结果。
- 配套一系列的脚本
    - db:generate 生成数据库迁移文件。数据库加表、改字段、添加索引等，多一个schema文件
    - db:migrate 数据库迁移
    - db:push 数据库推送
    - db:studio 数据库可视化工具