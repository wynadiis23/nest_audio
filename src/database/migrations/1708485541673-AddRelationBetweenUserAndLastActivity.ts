import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationBetweenUserAndLastActivity1708485541673
  implements MigrationInterface
{
  name = 'AddRelationBetweenUserAndLastActivity1708485541673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "last_activity"
                RENAME COLUMN "user" TO "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
                RENAME CONSTRAINT "UQ_390fe71bd802a64d11384075cf8" TO "UQ_4475bb1d954936031e4a351537c"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP CONSTRAINT "UQ_4475bb1d954936031e4a351537c"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD "user_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD CONSTRAINT "UQ_4475bb1d954936031e4a351537c" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD CONSTRAINT "FK_4475bb1d954936031e4a351537c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP CONSTRAINT "FK_4475bb1d954936031e4a351537c"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP CONSTRAINT "UQ_4475bb1d954936031e4a351537c"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD "user_id" character varying(128) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
            ADD CONSTRAINT "UQ_4475bb1d954936031e4a351537c" UNIQUE ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
                RENAME CONSTRAINT "UQ_4475bb1d954936031e4a351537c" TO "UQ_390fe71bd802a64d11384075cf8"
        `);
    await queryRunner.query(`
            ALTER TABLE "last_activity"
                RENAME COLUMN "user_id" TO "user"
        `);
  }
}
