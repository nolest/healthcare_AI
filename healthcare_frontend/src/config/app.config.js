// 环境配置
const getEnvironment = () => {
  // 可以通过环境变量或其他方式确定环境
  if (import.meta.env.PROD) return 'production';
  if (import.meta.env.MODE === 'test') return 'testing';
  return 'development';
};

const developmentConfig = {
  apiUrl: 'http://localhost:7723/api',
  staticUrl: 'http://localhost:7723',
  environment: 'development',
};

const testingConfig = {
  apiUrl: 'http://localhost:7724/api',
  staticUrl: 'http://localhost:7724',
  environment: 'testing',
};

const productionConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://43.134.141.188:6886/hcbe/api',
  staticUrl: import.meta.env.VITE_STATIC_URL || 'http://43.134.141.188:6886/hcbe',
  environment: 'production',
};

const getConfig = () => {
  const environment = getEnvironment();
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'testing':
      return testingConfig;
    default:
      return developmentConfig;
  }
};

export const appConfig = getConfig();

// 导出常用的配置值
export const {
  apiUrl,
  staticUrl,
  environment,
} = appConfig;

// 图片URL工具函数
export const getImageUrl = (userId, filename) => {
  if (!userId || !filename) return null;
  return `${staticUrl}/uploads/pic/${userId}/${filename}`;
};

export const getFullImageUrl = (relativePath) => {
  if (!relativePath) return null;
  
  // 如果已经是完整URL，直接返回
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // 确保路径以 / 开头
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${staticUrl}${normalizedPath}`;
}; 