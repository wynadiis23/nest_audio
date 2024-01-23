import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { SharedEntity } from '../../common/entity/shared.entity';
import { PlaylistContent } from '../../playlist-content/entity/playlist-content.entity';
import { TracksMetadata } from '../../tracks-metadata/entity/tracks-metadata.entity';

@Entity({ name: 'tracks' })
export class Tracks extends SharedEntity {
  @Column({ length: 128 })
  name: string;

  @Column({ length: 255 })
  path: string;

  @Column({ length: 128 })
  mimetype: string;

  @OneToMany(() => PlaylistContent, (playlistContent) => playlistContent.track)
  playlistContents: PlaylistContent[];

  @OneToOne(() => TracksMetadata, (tracksMetadata) => tracksMetadata.track, {
    cascade: true,
    eager: true,
  })
  trackMetadata: TracksMetadata;
}
