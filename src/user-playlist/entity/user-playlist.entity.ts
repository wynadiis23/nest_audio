import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { User } from '../../user/entity/user.entity';
import { Playlist } from '../../playlist/entity/playlist.entity';

@Entity({ name: 'user_playlist' })
export class UserPlaylist extends SharedEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'playlist_id' })
  playlistId: string;

  @Column({ name: 'hash' })
  hash: string;

  @ManyToOne(() => User, (user) => user.userPlaylists)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Playlist, (playlist) => playlist.userPlaylists)
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;
}
