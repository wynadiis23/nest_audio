import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastActivityTable1705654253373 implements MigrationInterface {
  name = 'AddLastActivityTable1705654253373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "last_activity" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "user" character varying(128) NOT NULL,
                "last_activity_time" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_86fcd71cbc954a452db081ac25d" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "last_activity"
        `);
  }
}
