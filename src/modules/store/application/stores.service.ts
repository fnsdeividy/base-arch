import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { state: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      if (filters.status === 'active') {
        where.isActive = true;
      } else if (filters.status === 'inactive') {
        where.isActive = false;
      }
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      stores,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async create(data: any) {
    return this.prisma.store.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || 'Brasil',
        phone: data.phone,
        email: data.email,
        type: data.type || 'branch',
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: any) {
    const store = await this.findById(id);

    return this.prisma.store.update({
      where: { id },
      data: {
        name: data.name ?? store.name,
        description: data.description ?? store.description,
        address: data.address ?? store.address,
        city: data.city ?? store.city,
        state: data.state ?? store.state,
        zipCode: data.zipCode ?? store.zipCode,
        country: data.country ?? store.country,
        phone: data.phone ?? store.phone,
        email: data.email ?? store.email,
        type: data.type ?? store.type,
        isActive: data.isActive ?? store.isActive,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.store.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    await this.findById(id);

    return this.prisma.store.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    await this.findById(id);

    return this.prisma.store.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async putInMaintenance(id: string, reason?: string) {
    await this.findById(id);

    // Por enquanto, vamos apenas desativar a loja
    // Em uma implementação futura, podemos adicionar um campo 'status' ou 'maintenanceReason'
    return this.prisma.store.update({
      where: { id },
      data: {
        isActive: false,
        // maintenanceReason: reason // Adicionar este campo no schema se necessário
      },
    });
  }

  async findByCity(city: string) {
    return this.prisma.store.findMany({
      where: {
        city: { contains: city, mode: 'insensitive' },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByState(state: string) {
    return this.prisma.store.findMany({
      where: {
        state: { contains: state, mode: 'insensitive' },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByType(type: string) {
    return this.prisma.store.findMany({
      where: {
        type: type as any,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByManager(managerId: string) {
    // Por enquanto retorna array vazio, pois não temos relação com manager implementada
    // Em uma implementação futura, adicionar campo managerId na tabela stores
    return [];
  }

  async findNearby(latitude: number, longitude: number, radiusKm: number) {
    // Por enquanto retorna array vazio, pois não temos coordenadas implementadas
    // Em uma implementação futura, adicionar campos latitude/longitude na tabela stores
    // e usar função de distância geográfica
    return [];
  }

  async getStatistics() {
    const [
      totalStores,
      activeStores,
      inactiveStores,
      storesByType,
      storesByState,
      storesByCity,
    ] = await Promise.all([
      this.prisma.store.count(),
      this.prisma.store.count({ where: { isActive: true } }),
      this.prisma.store.count({ where: { isActive: false } }),
      this.prisma.store.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.store.groupBy({
        by: ['state'],
        _count: { state: true },
      }),
      this.prisma.store.groupBy({
        by: ['city'],
        _count: { city: true },
      }),
    ]);

    // Transformar os resultados em objetos mais legíveis
    const typeStats = storesByType.reduce((acc, item) => {
      acc[item.type || 'unknown'] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    const stateStats = storesByState.reduce((acc, item) => {
      acc[item.state || 'unknown'] = item._count.state;
      return acc;
    }, {} as Record<string, number>);

    const cityStats = storesByCity.reduce((acc, item) => {
      acc[item.city || 'unknown'] = item._count.city;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStores,
      activeStores,
      inactiveStores,
      maintenanceStores: 0, // Por enquanto, até implementarmos status de manutenção
      storesByType: typeStats,
      storesByState: stateStats,
      storesByCity: cityStats,
    };
  }
}
