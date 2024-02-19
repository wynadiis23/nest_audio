import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientKeyUserOnLastActivity1708306307802
  implements MigrationInterface
{
  name = 'AddClientKeyUserOnLastActivity1708306307802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD "client_key" character varying
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "last_activity"."client_key" IS 'client key taken from activation key of iReap to keep uniqueness for each client'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            COMMENT ON COLUMN "last_activity"."client_key" IS 'client key taken from activation key of iReap to keep uniqueness for each client'
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP COLUMN "client_key"
        `);
  }
}
