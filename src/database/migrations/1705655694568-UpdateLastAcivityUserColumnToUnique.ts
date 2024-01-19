import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLastAcivityUserColumnToUnique1705655694568
  implements MigrationInterface
{
  name = 'UpdateLastAcivityUserColumnToUnique1705655694568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD CONSTRAINT "UQ_390fe71bd802a64d11384075cf8" UNIQUE ("user")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP CONSTRAINT "UQ_390fe71bd802a64d11384075cf8"
        `);
  }
}
