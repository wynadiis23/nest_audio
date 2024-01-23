import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleTableAndUpdateOnDeleteTokenOnUser1705984268826
  implements MigrationInterface
{
  name = 'AddUserRoleTableAndUpdateOnDeleteTokenOnUser1705984268826';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"
        `);
    await queryRunner.query(`
            CREATE TABLE "user_role" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "role" character varying(128) NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "user"."isActive" IS '1 for active and 0 for inactive'
        `);
    await queryRunner.query(`
            ALTER TABLE "user_role"
            ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "token"
            ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"
        `);
    await queryRunner.query(`
            COMMENT ON COLUMN "user"."isActive" IS NULL
        `);
    await queryRunner.query(`
            DROP TABLE "user_role"
        `);
    await queryRunner.query(`
            ALTER TABLE "token"
            ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
