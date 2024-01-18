import { Column, Entity, OneToMany } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { PlaylistContent } from '../../playlist-content/entity/playlist-content.entity';

@Entity({ name: 'tracks' })
export class Tracks extends SharedEntity {
  @Column({ length: 128 })
  name: string;

  @Column({ length: 255 })
  path: string;

  @Column({ length: 128 })
  mimetype: string;

  @OneToMany(
    () => PlaylistContent,
    (playlistContent) => playlistContent.track,
    {
      cascade: true,
      eager: true,
    },
  )
  playlistContents: PlaylistContent[];
}
