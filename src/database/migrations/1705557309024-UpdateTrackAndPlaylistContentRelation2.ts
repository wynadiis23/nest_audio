import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTrackAndPlaylistContentRelation21705557309024
  implements MigrationInterface
{
  name = 'UpdateTrackAndPlaylistContentRelation21705557309024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_9d79f537701598d145a6ee53f2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "trackId"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "track_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "track_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_de0f0175f4b12324dd058ff4f99" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_de0f0175f4b12324dd058ff4f99"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "track_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "track_id" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "trackId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_9d79f537701598d145a6ee53f2d" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
