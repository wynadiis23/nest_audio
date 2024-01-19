import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublishedColumnOnPlaylist1705645287042
  implements MigrationInterface
{
  name = 'AddPublishedColumnOnPlaylist1705645287042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist"
            ADD "published" integer NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist" DROP COLUMN "published"
        `);
  }
}
