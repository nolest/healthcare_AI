# 🌐 医疗AI系统 - 前端发布指南

## 📋 脚本说明

本项目提供了两个前端发布脚本：

### 1. `redeploy_frontend.sh` - 完整前端发布脚本
功能全面的前端发布脚本，支持多种发布模式：
- **完整重新发布前端（推荐）**：更新代码、清理依赖、重新构建、备份
- **仅更新代码并构建**：适用于代码修改后的发布
- **仅重新构建**：适用于配置修改后的重新构建
- **快速发布**：清理缓存并重新构建

### 2. `quick_frontend_deploy.sh` - 快速前端发布脚本
简化的前端发布脚本，适用于日常更新：
- 拉取最新代码
- 构建前端
- 设置权限
- 重新加载Nginx
- 验证部署

## 🚀 使用方法

### 在Ubuntu服务器上执行

1. **上传脚本到服务器**：
   ```bash
   # 方法1：通过git拉取（推荐）
   cd /home/ubuntu/code/healthcare_AI
   git pull origin prod
   
   # 方法2：手动上传
   scp redeploy_frontend.sh ubuntu@43.143.141.188:/home/ubuntu/
   scp quick_frontend_deploy.sh ubuntu@43.143.141.188:/home/ubuntu/
   ```

2. **添加执行权限**：
   ```bash
   chmod +x redeploy_frontend.sh
   chmod +x quick_frontend_deploy.sh
   ```

3. **执行前端发布**：
   
   **完整前端发布（推荐）**：
   ```bash
   ./redeploy_frontend.sh
   # 然后选择发布模式：
   # 1 - 完整重新发布前端（推荐）
   # 2 - 仅更新代码并构建
   # 3 - 仅重新构建
   # 4 - 快速发布
   ```
   
   **快速前端发布**：
   ```bash
   ./quick_frontend_deploy.sh
   ```

## 📊 发布模式对比

| 模式 | 更新代码 | 清理依赖 | 重新构建 | 创建备份 | 执行时间 | 适用场景 |
|------|----------|----------|----------|----------|----------|----------|
| 完整重新发布 | ✅ | ✅ | ✅ | ✅ | 较长 | 重大更新、依赖变更 |
| 仅更新代码并构建 | ✅ | ❌ | ✅ | ✅ | 中等 | 代码修改、小更新 |
| 仅重新构建 | ❌ | ❌ | ✅ | ✅ | 较短 | 配置修改 |
| 快速发布 | ❌ | ✅ | ✅ | ✅ | 中等 | 清理缓存问题 |

## 🔧 执行步骤详解

### 完整前端发布流程

1. **检查环境** - 验证前端目录存在
2. **创建备份** - 备份当前构建文件到 `/home/ubuntu/backup/`
3. **更新代码** - 从git仓库拉取最新前端代码
4. **清理依赖** - 删除node_modules和package-lock.json
5. **安装依赖** - 重新安装npm依赖
6. **设置环境变量** - 配置生产环境变量
7. **构建项目** - 执行npm run build
8. **检查构建** - 验证构建文件完整性
9. **设置权限** - 配置文件权限为www-data
10. **重新加载Nginx** - 应用新的前端文件
11. **验证部署** - 测试前端访问是否正常
12. **清理备份** - 清理旧的备份文件

### 环境变量配置

脚本会自动设置以下环境变量：
```bash
NODE_ENV=production
VITE_API_URL=http://43.143.141.188:6886/hcbe
VITE_STATIC_URL=http://43.143.141.188:6886
```

## 🛡️ 安全特性

### 自动备份
- 每次发布前自动备份当前构建文件
- 备份位置：`/home/ubuntu/backup/frontend_YYYYMMDD_HHMMSS`
- 自动清理旧备份（保留最近3个）

### 错误处理
- 构建失败时自动停止
- 详细的错误信息提示
- 提供故障排除建议

### 权限管理
- 自动设置正确的文件权限
- 确保Nginx可以正常访问静态文件

## 📝 常用命令

### 手动构建前端
```bash
cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
npm run build
```

### 查看构建文件
```bash
ls -la /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/
```

### 检查Nginx状态
```bash
sudo systemctl status nginx
```

### 查看Nginx日志
```bash
sudo tail -f /var/log/nginx/error.log
```

### 重新加载Nginx
```bash
sudo systemctl reload nginx
```

### 手动备份前端
```bash
sudo cp -r /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist /home/ubuntu/backup/frontend_manual_$(date +%Y%m%d_%H%M%S)
```

### 恢复备份
```bash
# 查看可用备份
ls -la /home/ubuntu/backup/

# 恢复指定备份
sudo rm -rf /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist
sudo mv /home/ubuntu/backup/frontend_YYYYMMDD_HHMMSS /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   ```bash
   cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **权限问题**
   ```bash
   sudo chown -R www-data:www-data /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/
   sudo chmod -R 755 /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/
   ```

3. **Nginx配置问题**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **前端访问404**
   ```bash
   # 检查Nginx配置
   sudo cat /etc/nginx/sites-available/healthcare
   
   # 检查前端文件是否存在
   ls -la /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist/
   ```

### 紧急恢复

如果前端发布失败：

1. **恢复最新备份**：
   ```bash
   sudo rm -rf /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist
   sudo mv /home/ubuntu/backup/frontend_* /home/ubuntu/code/healthcare_AI/healthcare_frontend/dist
   sudo systemctl reload nginx
   ```

2. **重新构建**：
   ```bash
   cd /home/ubuntu/code/healthcare_AI/healthcare_frontend
   npm run build
   sudo chown -R www-data:www-data dist/
   sudo systemctl reload nginx
   ```

## 📞 支持信息

- **前端源码路径**：`/home/ubuntu/code/healthcare_AI/healthcare_frontend`
- **构建文件路径**：`/home/ubuntu/code/healthcare_AI/healthcare_frontend/dist`
- **备份路径**：`/home/ubuntu/backup/`
- **Nginx配置文件**：`/etc/nginx/sites-available/healthcare`
- **访问地址**：`http://43.143.141.188:6886/`

## 🎯 最佳实践

1. **发布前准备**：
   - 确保前端修改已提交到git
   - 在本地测试前端构建
   - 选择合适的发布模式

2. **发布过程**：
   - 使用完整发布模式进行重大更新
   - 使用快速发布进行日常更新
   - 关注构建过程中的警告和错误

3. **发布后验证**：
   - 访问前端页面确认正常
   - 检查浏览器控制台是否有错误
   - 测试关键功能是否正常

4. **定期维护**：
   - 定期清理node_modules重新安装依赖
   - 监控构建文件大小
   - 定期清理旧备份

## 🚨 注意事项

1. **依赖管理**：
   - 如果package.json有变更，建议使用完整发布模式
   - 定期更新npm依赖以获得安全更新

2. **缓存问题**：
   - 如果前端更新后浏览器显示旧版本，清理浏览器缓存
   - 构建时会自动生成带hash的文件名避免缓存问题

3. **环境变量**：
   - 确保API地址配置正确
   - 生产环境和开发环境的配置不同

4. **文件权限**：
   - 确保Nginx用户(www-data)有权限访问构建文件
   - 避免使用root权限运行构建过程 