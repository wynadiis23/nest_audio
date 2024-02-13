import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthProviderAndIDColumnUser1707786534123
  implements MigrationInterface
{
  name = 'AddOAuthProviderAndIDColumnUser1707786534123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "oauth_provider" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "oauth_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "password" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "password"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "oauth_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "oauth_provider"
        `);
  }
}
