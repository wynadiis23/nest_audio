import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverPathColumnOnTrackMetadata1706174896248
  implements MigrationInterface
{
  name = 'AddCoverPathColumnOnTrackMetadata1706174896248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD "cover_path" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP COLUMN "cover_path"
        `);
  }
}
