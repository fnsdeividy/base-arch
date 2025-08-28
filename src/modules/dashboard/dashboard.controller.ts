import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics() {
    return await this.dashboardService.getMetrics();
  }

  @Get('recent-sales')
  async getRecentSales() {
    return await this.dashboardService.getRecentSales();
  }

  @Get('sales-chart')
  async getSalesChart() {
    return await this.dashboardService.getSalesChart();
  }
}
