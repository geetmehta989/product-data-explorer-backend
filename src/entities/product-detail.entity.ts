import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_details' })
@Unique(['productId'])
export class ProductDetail {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Product, (product) => product.detail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn!: string | null;

  @Column({ type: 'date', nullable: true })
  publicationDate!: string | null;

  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  rating!: string | null;

  @Column({ type: 'int', nullable: true })
  reviewCount!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;
}
