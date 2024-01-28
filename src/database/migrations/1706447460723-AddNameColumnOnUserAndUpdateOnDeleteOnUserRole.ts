import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameColumnOnUserAndUpdateOnDeleteOnUserRole1706447460723
  implements MigrationInterface
{
  name = 'AddNameColumnOnUserAndUpdateOnDeleteOnUserRole1706447460723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "name" character varying(128) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_role"
            ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "name"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_role"
            ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
