import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPathForWebMFormatTracks1709890979277
  implements MigrationInterface
{
  name = 'AddPathForWebMFormatTracks1709890979277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD "track_path_webm" character varying(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP COLUMN "track_path_webm"
        `);
  }
}
