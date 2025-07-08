# 生产环境图片上传500错误修复指南

## 问题描述
在生产环境中，当用户上传图片时，`POST /api/measurements` 和 `POST /api/covid-assessments` 接口返回500错误，但开发环境正常。

## 根本原因
1. **文件系统权限问题**: Docker容器中的非root用户无法创建/写入uploads目录
2. **目录不存在**: 生产环境中uploads目录结构未正确创建
3. **路径配置问题**: 容器内路径与开发环境路径不一致

## 修复方案

### 1. 更新Dockerfile (已修复)
```dockerfile
# 创建uploads目录并设置权限
RUN mkdir -p /app/uploads/pic/measurement /app/uploads/pic/covid
RUN chown -R nestjs:nodejs /app/uploads
RUN chmod -R 755 /app/uploads
```

### 2. 更新应用启动逻辑 (已修复)
在 `src/main.ts` 中添加了启动时目录检查和创建逻辑。

### 3. 增强错误处理和日志 (已修复)
- 在multer配置中添加了详细的日志记录
- 在controllers中添加了更好的错误处理
- 添加了目录写入权限测试

### 4. 创建检查脚本 (已添加)
`scripts/check-uploads.js` - 用于检查uploads目录状态

## 部署步骤

### 步骤1: 重新构建Docker镜像
```bash
cd healthcare_backend
docker build -t healthcare-backend:latest .
```

### 步骤2: 停止现有容器
```bash
docker stop healthcare-backend-container
docker rm healthcare-backend-container
```

### 步骤3: 启动新容器
```bash
docker run -d \
  --name healthcare-backend-container \
  -p 7723:3000 \
  -v /path/to/uploads:/app/uploads \
  -e NODE_ENV=production \
  healthcare-backend:latest
```

### 步骤4: 验证uploads目录
```bash
# 进入容器检查
docker exec -it healthcare-backend-container /bin/sh

# 运行检查脚本
node scripts/check-uploads.js

# 检查目录权限
ls -la uploads/
ls -la uploads/pic/
```

### 步骤5: 测试文件上传
使用前端或API工具测试文件上传功能。

## 监控和调试

### 查看详细日志
```bash
docker logs -f healthcare-backend-container
```

### 关键日志标识
- `[STARTUP]` - 应用启动时的目录检查
- `Upload destination` - 文件上传目标路径
- `Directory write test` - 目录写入权限测试
- `File filter` - 文件类型验证

### 常见错误和解决方案

#### 错误1: `EACCES: permission denied`
**原因**: 目录权限不足
**解决**: 
```bash
docker exec -it healthcare-backend-container chmod -R 755 /app/uploads
```

#### 错误2: `Upload directory is not writable`
**原因**: 目录无法写入
**解决**: 检查Docker卷挂载和容器内权限

#### 错误3: `ENOSPC: no space left on device`
**原因**: 磁盘空间不足
**解决**: 清理磁盘空间或增加存储

## 验证清单

- [ ] Docker镜像已重新构建
- [ ] 容器启动日志显示目录创建成功
- [ ] uploads目录权限正确(755)
- [ ] 目录写入测试通过
- [ ] 测量数据上传功能正常
- [ ] COVID评估上传功能正常
- [ ] 图片可以正常访问

## 回滚方案

如果修复后仍有问题，可以临时禁用文件上传：

1. 修改前端，暂时隐藏图片上传功能
2. 或者修改后端，跳过文件处理逻辑

```typescript
// 临时禁用文件上传的代码示例
const imagePaths = []; // 忽略files参数
```

## 联系支持

如果问题持续存在，请提供：
1. 完整的容器启动日志
2. 错误发生时的详细日志
3. 容器内uploads目录的权限信息
4. Docker环境信息 