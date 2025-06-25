import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '医疗AI系统后端API',
      version: '1.0.0',
      port: process.env.PORT || 7723
    };
  }

  getSystemInfo(): object {
    return {
      name: '医疗AI系统',
      description: '远程医疗健康监测系统后端API',
      version: '1.0.0',
      author: 'Healthcare AI Team',
      frontend: 'http://localhost:6886',
      api: 'http://localhost:7723/api',
      docs: 'http://localhost:7723/api-docs',
      features: [
        '用户认证与授权',
        '健康数据监测',
        'COVID-19风险评估', 
        '诊断记录管理',
        '医患数据管理'
      ],
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        measurements: '/api/measurements',
        diagnoses: '/api/diagnoses',
        covid: '/api/covid-assessments'
      }
    };
  }
}
