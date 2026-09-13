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

## words表

github 下载 zip -> json文件(178kb) 
想创建一个words表，导入这个数据，json -> sql/csv 直接导入数据库
ai 上下文 #json 转成csv格式， 描述字段
178kb token开销很大，让ai写一段格式转换脚本(token开销小)，本地运行

### 数据清洗

ai做，上下文比较大。上下文窗口是有限制的，还得考虑token开销，所以不让AI直接做。

- 常见的后端功能
    - /scripts 编写一些脚本解决一些问题，比如爬虫、数据格式转换等等。让AI生成一个script脚本，本地运行。

- RLS
    - 行安全，words公共表没必要开启。而每个用户的背单词记录需要开启。
- prompt执行上下文考虑
    - 给prompt提供充足的上下文，比如把数据表，技术架构文档，放在Agents.md文件中。
    - 这些也是隐藏的上下文开销，不让一些数据文件直接让AI读，比如给他文件的格式。

### 让AI了解supabase有books表

- 本地建schema
- 后台图书业务

## cascade 级联删除

外键声明后面加上 ON DELETE CASCADE

## Prompt颗粒度

- 上下文一定要准确且清晰
- 规则或规范，表单字段，业务场景，功能描述要详细表达，不能让LLM去猜
- LLM擅长的，比如生成代码，让他自己去跑。

## 多端

- PC端
    - SEO办公
- h5 手机网页端
    - 手机端适配
- 客户端
    - android
    - ios
    - React Native/flutter  
- 桌面端
    - C/S架构 electron

## h5 web应用

- nextjs模板
    - 不用从0开发
- clear/compact 上下文
    - 新项目重新启动新的对话窗口