import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTrackAndPlaylistContentRelation1705556549544
  implements MigrationInterface
{
  name = 'UpdateTrackAndPlaylistContentRelation1705556549544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "trackId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_9d79f537701598d145a6ee53f2d" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_9d79f537701598d145a6ee53f2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "trackId"
        `);
  }
}
