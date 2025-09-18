import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Category } from './category.entity';
import { ProductDetail } from './product-detail.entity';

@Entity({ name: 'products' })
@Unique(['sourceId'])
@Index(['title', 'author'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId!: string | null;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price!: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text' })
  productUrl!: string;

  @Column({ type: 'varchar', length: 255 })
  sourceId!: string;

  @OneToOne(() => ProductDetail, (detail) => detail.product)
  detail?: ProductDetail;
}
