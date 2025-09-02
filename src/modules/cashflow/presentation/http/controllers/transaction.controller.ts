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

@Controller('api/v1/cashflow')
// @UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    const userId = req.user.id; // Assumindo que o JWT guard adiciona o usuário ao req
    return this.transactionService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(
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
    return this.transactionService.findAll({
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
  getCashFlowSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.transactionService.getCashFlowSummary({ startDate, endDate, storeId });
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
