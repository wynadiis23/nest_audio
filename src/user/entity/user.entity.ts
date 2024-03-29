import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { Exclude } from 'class-transformer';
import { InternalServerErrorException } from '@nestjs/common';
import { Token } from '../../token/entity/token.entity';
import { UserRole } from '../../user-role/entity/user-role.entity';
import { UserPlaylist } from '../../user-playlist/entity/user-playlist.entity';
import { LastActivity } from '../../last-activity/entity/last-activity.entity';

@Entity({ name: 'user' })
@Unique(['username', 'email'])
export class User extends SharedEntity {
  @Column({ length: 128, nullable: false })
  username: string;

  @Column({ length: 128, name: 'email' })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Column({ default: 1, comment: '1 for active and 0 for inactive' })
  isActive: number;

  @Column({ length: 128, name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'oauth_provider' })
  oauthProvider: string;

  @Column({ nullable: true, name: 'oauth_id' })
  oauthId: string;

  @OneToMany(() => Token, (token) => token.user, {
    cascade: true,
  })
  refreshTokens: Token[];

  @OneToMany(() => UserRole, (userRole) => userRole.user, {
    cascade: true,
    eager: true,
  })
  roles: UserRole[];

  @OneToMany(() => UserPlaylist, (userPlaylist) => userPlaylist.user)
  userPlaylists: UserPlaylist[];

  @OneToOne(() => LastActivity, (lastActivity) => lastActivity.user, {
    cascade: true,
  })
  lastActivity: LastActivity;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
