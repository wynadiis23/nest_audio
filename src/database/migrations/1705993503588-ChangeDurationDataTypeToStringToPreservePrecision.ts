import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDurationDataTypeToStringToPreservePrecision1705993503588
  implements MigrationInterface
{
  name = 'ChangeDurationDataTypeToStringToPreservePrecision1705993503588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP COLUMN "duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD "duration" character varying
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "tracks_metadata"."duration" IS 'duration in second'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            COMMENT ON COLUMN "tracks_metadata"."duration" IS 'duration in second'
        `);
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP COLUMN "duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD "duration" integer
        `);
  }
}
