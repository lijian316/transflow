# TransFlow - 多语言翻译管理系统

TransFlow 是一个强大的多语言翻译管理系统，专为需要管理多语言内容的企业和开发者设计。

## 🌟 主要特性

- **多语言支持**: 支持27种语言的翻译管理
- **智能标签系统**: 轻松分类和组织翻译内容
- **实时统计**: 掌握翻译进度和质量
- **一键导出**: 支持多种格式导出（JSON、CSV等）
- **智能搜索**: 快速定位所需翻译内容
- **操作日志**: 完整的操作记录追踪
- **数据库管理**: 支持多项目数据库管理

## 🚀 快速开始

### 环境要求

- Node.js 16+
- Python 3.8+ (后端API)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd transflow
   ```

2. **安装前端依赖**
   ```bash
   npm install
   ```

3. **安装后端依赖**
   ```bash
   pip install -r requirements.txt
   ```

4. **启动后端服务**
   ```bash
   python app.py
   ```

5. **启动前端开发服务器**
   ```bash
   npm start
   ```

6. **访问应用**
   - 宣传主页: http://localhost:3000
   - 管理后台: http://localhost:3000/dashboard

## 📁 项目结构

```
transflow/
├── src/                    # React前端源码
│   ├── components/         # 组件目录
│   │   ├── LandingPage.js  # 宣传主页
│   │   ├── Main.js         # 主管理界面
│   │   └── Footer.js       # 页脚组件
│   ├── locales/            # 国际化文件
│   └── App.js              # 主应用组件
├── public/                 # 静态资源
├── databases/              # 数据库文件目录
├── app.py                  # Flask后端API
└── requirements.txt        # Python依赖
```

## 🎨 技术栈

### 前端
- **React 18** - 用户界面框架
- **Ant Design** - UI组件库
- **Semantic UI** - 宣传页面样式
- **React Router** - 路由管理
- **Axios** - HTTP客户端

### 后端
- **Flask** - Web框架
- **SQLite** - 数据库
- **SQLAlchemy** - ORM

## 🌐 支持的语言

- 中文 (Chinese)
- English
- Français (French)
- Deutsch (German)
- Español (Spanish)
- Italiano (Italian)
- Português (Portuguese)
- Русский (Russian)
- 日本語 (Japanese)
- 한국어 (Korean)
- العربية (Arabic)
- 以及更多...

## 📊 功能模块

### 1. 翻译管理
- 添加/编辑/删除翻译条目
- 批量操作
- 翻译状态跟踪

### 2. 标签管理
- 创建自定义标签
- 按标签筛选内容
- 标签统计

### 3. 数据库管理
- 多项目数据库支持
- 数据库切换
- 数据导入导出

### 4. 语言管理
- 语言激活/停用
- 语言优先级设置
- 语言统计

### 5. 操作日志
- 完整的操作记录
- 操作类型分类
- 时间戳记录

## 🚀 部署

### Vercel 部署

1. **准备部署**
   ```bash
   npm run build
   ```

2. **配置 Vercel**
   - 连接 GitHub 仓库
   - 设置构建命令: `npm run build`
   - 设置输出目录: `build`

3. **环境变量**
   - 配置后端API地址
   - 设置数据库连接

### 其他部署方式

- **Netlify**: 类似Vercel的静态部署
- **Docker**: 容器化部署
- **传统服务器**: Nginx + PM2

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系我们

- 项目主页: [TransFlow](https://transflow.app)
- 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: support@transflow.app

---

**TransFlow** - 让多语言管理变得简单高效 🌍 