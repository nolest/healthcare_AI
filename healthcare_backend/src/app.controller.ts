import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@Controller()
@ApiTags('系统信息')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '系统首页 - 重定向到前端应用' })
  redirectToFrontend(@Res() res: Response) {
    // 重定向到前端应用
    return res.redirect('http://localhost:6886');
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  getHealth(): object {
    return this.appService.getHealth();
  }

  @Get('info')
  @ApiOperation({ summary: '系统信息' })
  getInfo(): object {
    return this.appService.getSystemInfo();
  }
}
