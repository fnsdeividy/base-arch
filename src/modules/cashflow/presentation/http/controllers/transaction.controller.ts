import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { TransactionService } from '@modules/cashflow/application/services/transaction.service';
import { CreateTransactionDto } from '@modules/cashflow/presentation/dto/createTransaction.dto';
import { UpdateTransactionDto } from '@modules/cashflow/presentation/dto/updateTransaction.dto';
// import { JwtAuthGuard } from '@shared/presentation/http/guards/jwt-auth.guard';

@Controller('cashflow')
// @UseGuards(JwtAuthGuard) - Temporariamente desabilitado para desenvolvimento
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    // Para desenvolvimento, usar um userId padrão quando não há autenticação
    const userId = req.user?.id || 'dev-user-id';
    const result = await this.transactionService.create(createTransactionDto, userId);

    return {
      success: true,
      data: result
    };
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.transactionService.findAll({
      type: type as any,
      category,
      startDate,
      endDate,
      storeId,
      minAmount,
      maxAmount,
      page,
      limit
    });

    return {
      success: true,
      data: result
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.delete(id);
  }

  @Get('summary/overview')
  async getCashFlowSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
  ) {
    const result = await this.transactionService.getCashFlowSummary({ startDate, endDate, storeId });

    return {
      success: true,
      data: result
    };
  }

  @Get('categories/list')
  getCategories() {
    return this.transactionService.getCategories();
  }

  @Get('by-date-range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionService.findByDateRange(startDate, endDate);
  }

  @Get('by-category/:category')
  findByCategory(@Param('category') category: string) {
    return this.transactionService.findByCategory(category);
  }

  @Get('by-store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.transactionService.findByStore(storeId);
  }

  @Get('statistics/overview')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.transactionService.getStatistics({ startDate, endDate, storeId });
  }

  @Get('export/transactions')
  exportTransactions(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
  ) {
    return this.transactionService.exportTransactions(
      { type: type as any, category, startDate, endDate, storeId },
      format
    );
  }
}
