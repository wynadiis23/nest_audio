import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackPathOnTrackMetadata1709621429005
  implements MigrationInterface
{
  name = 'AddTrackPathOnTrackMetadata1709621429005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD "track_path" character varying(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP COLUMN "track_path"
        `);
  }
}
