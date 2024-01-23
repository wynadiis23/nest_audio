import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenTableAndRelationToUser1705974011151
  implements MigrationInterface
{
  name = 'AddTokenTableAndRelationToUser1705974011151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "refresh_token" character varying NOT NULL,
                "user_id" uuid NOT NULL,
                "token_family_id" character varying NOT NULL,
                CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "token"
            ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"
        `);
    await queryRunner.query(`
            DROP TABLE "token"
        `);
  }
}
