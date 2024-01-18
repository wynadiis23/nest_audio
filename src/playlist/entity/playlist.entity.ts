import { Column, Entity, OneToMany } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { PlaylistContent } from '../../playlist-content/entity/playlist-content.entity';

@Entity({ name: 'playlist' })
export class Playlist extends SharedEntity {
  @Column({ length: 128 })
  name: string;

  @OneToMany(
    () => PlaylistContent,
    (playlistContent) => playlistContent.playlist,
    {
      cascade: true,
      eager: true,
    },
  )
  playlistContents: PlaylistContent[];
}
