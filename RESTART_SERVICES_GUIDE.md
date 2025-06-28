# 服务重启指南

## 配置修复完成

已将前后端配置恢复到正确的端口：
- **后端端口**: 7723
- **前端端口**: 6886
- **API地址**: http://localhost:7723/api

## 重启步骤

### 1. 停止当前服务
如果有服务在运行，请先停止它们（Ctrl+C）

### 2. 重启后端服务
```bash
cd healthcare_backend
npm run build
npm start
```

### 3. 重启前端服务
```bash
cd healthcare_frontend
npm run dev
```

### 4. 验证服务
- 后端API: http://localhost:7723/api
- 前端应用: http://localhost:6886
- 图片服务: http://localhost:7723/uploads/

## 图片URL修复状态

✅ 配置文件已修复
✅ 前后端端口已统一
✅ CORS策略已更新
✅ 图片URL生成逻辑已优化

现在图片应该能正常显示，完整URL格式：
`http://localhost:7723/uploads/pic/用户ID/文件名` 