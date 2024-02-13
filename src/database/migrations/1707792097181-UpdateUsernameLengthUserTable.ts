import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsernameLengthUserTable1707792097181
  implements MigrationInterface
{
  name = 'UpdateUsernameLengthUserTable1707792097181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_f4ca2c1e7c96ae6e8a7cca9df80"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "username"
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "username" character varying(128) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_f4ca2c1e7c96ae6e8a7cca9df80" UNIQUE ("username", "email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_f4ca2c1e7c96ae6e8a7cca9df80"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "username"
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "username" character varying(15) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_f4ca2c1e7c96ae6e8a7cca9df80" UNIQUE ("username", "email")
        `);
  }
}
