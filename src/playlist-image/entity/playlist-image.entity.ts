import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { Playlist } from '../../playlist/entity/playlist.entity';

@Entity({ name: 'playlist_image' })
export class PlaylistImage extends SharedEntity {
  @Column({ length: 255, nullable: true })
  path: string;

  @Column({ length: 255, nullable: true, name: 'thumb_path' })
  thumbPath: string;

  @Column({ length: 255, nullable: true, name: 'small_thumb_path' })
  smallThumbPath: string;

  @Column({ length: 255, nullable: true, name: 'tiny_thumb_path' })
  tinyThumbPath: string;

  @Column({ name: 'playlist_id', type: 'uuid' })
  playlistId: string;
  @OneToOne(() => Playlist, (playlist) => playlist.image, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;
}
