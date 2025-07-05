# 国际化 (i18n) 使用指南

## 概述

本项目已完成国际化功能，支持以下语言：
- 繁体中文 (zh-TW) - 默认语言
- 简体中文 (zh-CN)
- 英语 (en)

## 功能特性

### 1. 语言切换
- 用户可以通过页面右上角的语言切换器更改界面语言
- 语言设置会自动保存到 localStorage，下次访问时会记住用户的选择
- 语言切换是实时的，无需刷新页面

### 2. 全局覆盖
已完成国际化的组件和页面：
- ✅ 登录页面 (LoginPage)
- ✅ 注册页面 (RegisterPage)
- ✅ 登录表单 (LoginForm)
- ✅ 注册表单 (RegisterForm)
- ✅ 患者控制台 (PatientDashboard)
- ✅ 医护人员控制台 (MedicalStaffDashboard)
- ✅ 语言切换器 (LanguageSwitcher)

### 3. 响应式翻译
- 所有组件都会在语言切换时自动更新显示的文本
- 支持带参数的翻译（如用户名插值）

## 技术实现

### 1. 核心文件
- `src/utils/i18n.js` - 国际化核心类
- `src/components/LanguageSwitcher.jsx` - 语言切换组件

### 2. 使用方法

#### 在组件中使用 i18n

```jsx
import { useState, useEffect } from 'react'
import i18n from '../utils/i18n'

export default function MyComponent() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    // 监听语言变化
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    
    return () => {
      i18n.removeListener(handleLanguageChange)
    }
  }, [])

  return (
    <div>
      <h1>{i18n.t('app.title')}</h1>
      <p>{i18n.t('auth.welcome', { name: 'John' })}</p>
    </div>
  )
}
```

#### 翻译键命名规范

翻译键采用点分隔的层次结构：

```
分类.子分类.具体项目
```

例如：
- `app.title` - 应用标题
- `auth.login` - 登录
- `auth.placeholder.username` - 用户名占位符
- `dashboard.patient.title` - 患者控制台标题

### 3. 添加新翻译

在 `src/utils/i18n.js` 文件中添加新的翻译键：

```javascript
// 繁体中文
'zh-TW': {
  'new.translation.key': '新的翻译文本',
  // ...
}

// 简体中文
'zh-CN': {
  'new.translation.key': '新的翻译文本',
  // ...
}

// 英语
'en': {
  'new.translation.key': 'New translation text',
  // ...
}
```

### 4. 参数替换

支持在翻译文本中使用参数：

```javascript
// 翻译定义
'welcome.message': 'Welcome, {name}!'

// 使用
i18n.t('welcome.message', { name: 'John' })
// 输出: "Welcome, John!"
```

## API 参考

### i18n 类方法

#### `t(key, params = {})`
获取翻译文本
- `key`: 翻译键
- `params`: 参数对象（可选）
- 返回: 翻译后的文本

#### `setLanguage(language)`
设置当前语言
- `language`: 语言代码 ('zh-TW', 'zh-CN', 'en')

#### `getCurrentLanguage()`
获取当前语言代码

#### `getAvailableLanguages()`
获取可用语言列表

#### `addListener(callback)`
添加语言变化监听器
- `callback`: 回调函数，接收新语言代码作为参数

#### `removeListener(callback)`
移除语言变化监听器

## 最佳实践

### 1. 组件国际化模式

```jsx
import { useState, useEffect } from 'react'
import i18n from '../utils/i18n'

export default function MyComponent() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage)
    }
    
    i18n.addListener(handleLanguageChange)
    return () => i18n.removeListener(handleLanguageChange)
  }, [])

  // 组件内容...
}
```

### 2. 翻译键组织

按功能模块组织翻译键：

```
common.*          - 通用文本（保存、取消、确认等）
app.*            - 应用相关（标题、描述等）
auth.*           - 认证相关（登录、注册等）
dashboard.*      - 控制台相关
patient.*        - 患者相关
medical.*        - 医护人员相关
measurement.*    - 测量相关
diagnosis.*      - 诊断相关
```

### 3. 错误处理

如果翻译键不存在，系统会返回原键名，便于调试：

```javascript
i18n.t('non.existent.key')  // 返回: "non.existent.key"
```

## 测试

运行测试脚本验证国际化功能：

```bash
node healthcare_frontend/test_i18n.js
```

## 维护

### 添加新语言

1. 在 `i18n.js` 中添加新语言的翻译对象
2. 更新 `getAvailableLanguages()` 方法
3. 在 `LanguageSwitcher` 组件中添加新语言选项

### 添加新翻译

1. 确定合适的翻译键名
2. 为所有支持的语言添加对应翻译
3. 在组件中使用 `i18n.t()` 调用

### 翻译质量保证

- 确保所有语言版本的翻译都已添加
- 定期检查翻译的准确性和一致性
- 考虑不同语言的文化差异

## 注意事项

1. **性能**: 语言切换是实时的，但大量文本的页面可能需要一些时间来更新
2. **存储**: 用户的语言选择保存在 localStorage 中
3. **默认语言**: 如果用户没有设置语言偏好，系统默认使用繁体中文
4. **回退机制**: 如果翻译键不存在，会返回键名本身，便于调试

## 未来扩展

- 可以考虑添加更多语言支持
- 可以集成专业的翻译管理工具
- 可以添加翻译缓存机制以提高性能
- 可以添加翻译完整性检查工具 