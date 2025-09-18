import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Category } from './category.entity';

@Entity({ name: 'headings' })
@Unique(['sourceId'])
@Index(['slug'], { unique: true })
export class Heading {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  sourceId!: string;

  @OneToMany(() => Category, (category) => category.heading)
  categories!: Category[];
}
