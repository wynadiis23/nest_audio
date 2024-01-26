import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePlaylistContentTable1706254132462
  implements MigrationInterface
{
  name = 'UpdatePlaylistContentTable1706254132462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "track_name"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "name" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "album" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "artist" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "duration" character varying
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "playlist_content"."duration" IS 'duration in second'
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "cover_path" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "cover_path"
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "playlist_content"."duration" IS 'duration in second'
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "artist"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "album"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP COLUMN "name"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD "track_name" character varying(255) NOT NULL
        `);
  }
}
