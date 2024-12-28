# 对话助手

这是一个集成了语音生成和短信界面生成的对话工具，可以帮助用户生成对话语音和模拟 iOS 风格的短信界面。

## 主要功能

### 1. 语音生成功能

#### 1.1 API 密钥管理
- 支持 ElevenLabs API 密钥验证
- 自动保存 API 密钥，无需重复输入
- API 状态实时显示

#### 1.2 角色管理
- 支持添加多个对话角色
- 为每个角色选择不同的声音
- 可调整声音参数：
  - 稳定性（stability）
  - 相似度（similarity_boost）
  - 风格夸张度（style_exaggeration）
- 角色信息自动保存

#### 1.3 对话输入和语音生成
- 支持批量输入对话内容
- 实时预览对话内容
- 自动识别角色和对话文本
- 单独生成每句对话的语音
- 支持试听和下载
- 支持合并所有对话音频（可选择是否去除静音）

### 2. 短信界面生成功能

#### 2.1 界面配置
- 支持设置发送方和接收方标识
- 可自定义联系人名称
- 支持上传和裁剪联系人头像
- 配置信息自动保存

#### 2.2 对话输入
- 支持文本格式的对话输入
- 支持图片消息插入
- 自动识别发送方和接收方
- 支持多行消息自动继承发送方

#### 2.3 界面预览
- 实时预览 iOS 风格的短信界面
- 支持导出对话截图
- 自动生成递增的文件名（格式：短信截图YYYYMMDD##）

#### 2.4 视觉效果
- 精确还原 iOS 深色模式界面
- 支持消息气泡尾部特效
- 平滑的滚动效果
- 精确的间距和布局

## 使用方法

### 1. 语音生成

1. 在导航菜单选择"语音生成"
2. 输入并验证 ElevenLabs API 密钥
3. 添加对话角色并设置声音
4. 输入对话内容（格式：角色名: 对话内容）
5. 点击"生成语音"，等待生成完成
6. 可选择合并或单独下载音频

### 2. 短信界面生成

1. 在导航菜单选择"短信界面"
2. 设置发送方和接收方标识
3. 配置联系人信息和头像
4. 在文本框中输入对话内容：
   ```
   Ethan: 你好
   Lily: 你好啊
   ```
5. 需要插入图片时，点击"+"按钮
6. 点击"生成对话"预览效果
7. 点击"导出对话截图"保存图片

## 文件结构

```
dialogue-voice/
├── index.html          # 主页面
├── css/
│   ├── style.css      # 全局样式
│   └── chat-bubble.css # 短信界面样式
├── js/
│   ├── api.js         # API 接口封装
│   ├── audio.js       # 音频处理功能
│   ├── dialogue-generator.js  # 语音生成功能
│   ├── message-generator.js   # 短信界面功能
│   └── main.js        # 主程序逻辑
└── README.md          # 说明文档
```

## 技术特点

1. **界面设计**
   - 响应式布局
   - iOS 原生风格还原
   - 流畅的动画效果

2. **功能实现**
   - 模块化的代码结构
   - 本地数据持久化
   - 实时预览功能

3. **用户体验**
   - 直观的操作界面
   - 实时反馈
   - 自动保存配置

## 浏览器支持

- 推荐使用最新版本的 Chrome、Firefox 或 Safari
- 需要支持现代 Web API（如 Web Audio API）
- 建议使用桌面浏览器以获得最佳体验

## 注意事项

1. **API 使用**
   - 需要有效的 ElevenLabs API 密钥
   - 注意 API 使用配额限制
   - 确保网络连接正常

2. **数据存储**
   - 配置信息存储在 localStorage 中
   - 清除浏览器数据会重置所有设置

3. **图片处理**
   - 支持常见图片格式
   - 建议使用小于 2MB 的图片
   - 图片会自动调整大小以适应界面

## 隐私说明

- 所有数据仅保存在本地浏览器中
- API 密钥仅用于与 ElevenLabs 服务器通信
- 不会收集或上传任何个人信息

## 故障排除

如果遇到问题，请尝试：
1. 检查 API 密钥是否有效
2. 确认网络连接正常
3. 查看浏览器控制台是否有错误信息
4. 清除浏览器缓存后重试
5. 确保使用最新版本的浏览器 