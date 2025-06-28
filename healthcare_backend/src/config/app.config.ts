export interface AppConfig {
  port: number;
  apiUrl: string;
  frontendUrl: string;
  staticUrl: string;
  environment: 'development' | 'testing' | 'production';
}

const getEnvironment = (): 'development' | 'testing' | 'production' => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return 'production';
  if (env === 'test' || env === 'testing') return 'testing';
  return 'development';
};

const developmentConfig: AppConfig = {
  port: 7723,
  apiUrl: 'http://localhost:7723',
  frontendUrl: 'http://localhost:6886',
  staticUrl: 'http://localhost:7723',
  environment: 'development',
};

const testingConfig: AppConfig = {
  port: 7724,
  apiUrl: 'http://localhost:7724',
  frontendUrl: 'http://localhost:6887',
  staticUrl: 'http://localhost:7724',
  environment: 'testing',
};

const productionConfig: AppConfig = {
  port: parseInt(process.env.PORT || '7723'),
  apiUrl: process.env.API_URL || 'https://your-api-domain.com',
  frontendUrl: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
  staticUrl: process.env.STATIC_URL || 'https://your-api-domain.com',
  environment: 'production',
};

const getConfig = (): AppConfig => {
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
  port,
  apiUrl,
  frontendUrl,
  staticUrl,
  environment,
} = appConfig; 