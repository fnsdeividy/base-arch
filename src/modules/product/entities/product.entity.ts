import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '@modules/store/entities/store.entity';

@Entity()
export class Product {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice?: number;

  @Column({ type: 'int' })
  stockQuantity: number;

  @Column({ type: 'int', default: 0 })
  minStockLevel: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  weightUnit?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 