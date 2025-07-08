# 图片上传问题诊断和修复指南

## 问题描述
用户在提交测量记录时，图片上传失败，返回500内部服务器错误。

## 错误分析
根据前端日志分析：
- 图片上传进度正常（44% → 59% → 96% → 100%）
- 但API返回500错误：`{"statusCode":500,"message":"Internal server error"}`
- 请求路径：`POST http://43.134.141.188:6886/hcbe/api/measurements`

## 可能的原因

### 1. Docker容器内uploads目录权限问题
- 容器内的/app/uploads目录不存在或权限不足
- 无法创建用户特定的子目录
- 文件系统权限错误

### 2. multer配置问题
- 目录创建失败
- 文件写入权限不足
- 文件类型验证问题

### 3. 卷映射问题
- docker-compose.yml中的volumes配置冲突
- 本地目录与容器目录映射不正确

## 修复方案

### 方案1：使用完整修复脚本
```bash
# 在Ubuntu服务器上执行
chmod +x fix_image_upload.sh
./fix_image_upload.sh
```

### 方案2：使用简化修复脚本
```bash
# 在Ubuntu服务器上执行
chmod +x fix_image_upload_simple.sh
./fix_image_upload_simple.sh
```

### 方案3：使用multer配置修复脚本
```bash
# 在Ubuntu服务器上执行
chmod +x fix_multer_config.sh
./fix_multer_config.sh
```

### 方案4：手动修复步骤

#### 步骤1：检查当前状态
```bash
cd healthcare_backend
docker-compose ps
docker-compose logs backend --tail=50
```

#### 步骤2：停止容器并创建目录
```bash
docker-compose down
mkdir -p uploads/pic/measurement
mkdir -p uploads/pic/covid
chmod -R 755 uploads/
```

#### 步骤3：修复docker-compose.yml
编辑`healthcare_backend/docker-compose.yml`，确保volumes配置正确：
```yaml
volumes:
  - ./uploads:/app/uploads:rw
```

#### 步骤4：重新启动容器
```bash
docker-compose up -d
```

#### 步骤5：测试权限
```bash
# 测试容器内目录权限
docker exec healthcare_backend_container ls -la /app/uploads/
docker exec healthcare_backend_container mkdir -p /app/uploads/pic/measurement/test_user
docker exec healthcare_backend_container touch /app/uploads/pic/measurement/test_user/test.txt
docker exec healthcare_backend_container rm -rf /app/uploads/pic/measurement/test_user/
```

## 验证修复

### 1. 检查容器状态
```bash
docker-compose ps
```
确保所有容器都在运行状态。

### 2. 检查目录权限
```bash
docker exec healthcare_backend_container ls -la /app/uploads/pic/
```

### 3. 查看后端日志
```bash
docker-compose logs backend --tail=50
```

### 4. 前端测试
访问 http://43.134.141.188:6886/，登录后尝试上传图片。

## 常见问题和解决方案

### 问题1：目录权限不足
```bash
# 解决方案：设置正确的权限
chmod -R 755 healthcare_backend/uploads/
```

### 问题2：Docker卷映射冲突
```bash
# 解决方案：清理Docker卷
docker-compose down
docker volume prune
```

### 问题3：容器内目录不存在
```bash
# 解决方案：在Dockerfile中预创建目录
RUN mkdir -p /app/uploads/pic/measurement && \
    mkdir -p /app/uploads/pic/covid && \
    chmod -R 755 /app/uploads/
```

## 监控和日志

### 查看实时日志
```bash
docker-compose logs -f backend
```

### 查看特定时间的日志
```bash
docker-compose logs backend --since="2024-01-08T10:00:00"
```

### 查看错误日志
```bash
docker-compose logs backend 2>&1 | grep -i error
```

## 预防措施

1. **定期备份uploads目录**
2. **监控磁盘空间**
3. **设置日志轮转**
4. **定期检查容器健康状态**

## 联系支持

如果以上方案都无法解决问题，请提供以下信息：
1. 容器状态：`docker-compose ps`
2. 后端日志：`docker-compose logs backend --tail=100`
3. 目录权限：`ls -la healthcare_backend/uploads/`
4. 系统信息：`df -h` 和 `free -h` 