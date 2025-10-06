import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesService } from '@modules/sales/application/services/sales.service';

// Controller específico para compatibilidade com o frontend
// Responde diretamente em /sales sem o prefixo /api/v1
@Controller()
export class SalesCompatController {
  constructor(private readonly salesService: SalesService) { }

  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.salesService.findAll(pageNum, limitNum);
  }
}
