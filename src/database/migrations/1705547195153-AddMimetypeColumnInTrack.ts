import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMimetypeColumnInTrack1705547195153
  implements MigrationInterface
{
  name = 'AddMimetypeColumnInTrack1705547195153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks"
            ADD "mimetype" character varying(128) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks" DROP COLUMN "mimetype"
        `);
  }
}
