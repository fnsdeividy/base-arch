import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '@modules/product/entities/product.entity';
import { Store } from '@modules/store/entities/store.entity';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'min_quantity', type: 'int', default: 0 })
  minQuantity: number;

  @Column({ name: 'max_quantity', type: 'int', nullable: true })
  maxQuantity?: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
