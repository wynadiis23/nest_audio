import { Exclude } from 'class-transformer';
import {
  AfterLoad,
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export class SharedEntity extends BaseEntity {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __entity?: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @Column({ length: 25, name: 'created_by', default: 'SYSTEM', select: false })
  @Exclude()
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;

  @Column({ length: 25, name: 'updated_by', default: 'SYSTEM', select: false })
  @Exclude()
  updatedBy: string;

  @DeleteDateColumn({ name: 'deleted_date', nullable: true })
  deletedDate: Date;

  @VersionColumn({ name: 'data_version', default: 1 })
  version: number;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }
}
