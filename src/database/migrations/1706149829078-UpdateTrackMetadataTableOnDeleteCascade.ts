import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTrackMetadataTableOnDeleteCascade1706149829078
  implements MigrationInterface
{
  name = 'UpdateTrackMetadataTableOnDeleteCascade1706149829078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP CONSTRAINT "FK_4fdc35f0ed7d4962e261c070445"
        `);
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD CONSTRAINT "FK_4fdc35f0ed7d4962e261c070445" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP CONSTRAINT "FK_4fdc35f0ed7d4962e261c070445"
        `);
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD CONSTRAINT "FK_4fdc35f0ed7d4962e261c070445" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
