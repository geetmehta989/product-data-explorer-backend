import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Heading } from './heading.entity';
import { Product } from './product.entity';

@Entity({ name: 'categories' })
@Unique(['sourceId'])
@Index(['slug'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Heading, (heading) => heading.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'heading_id' })
  heading!: Heading;

  @Column({ name: 'heading_id' })
  headingId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  url!: string | null;

  @Column({ type: 'varchar', length: 255 })
  sourceId!: string;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
