import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTracksTable1705541677712 implements MigrationInterface {
  name = 'AddTracksTable1705541677712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "tracks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "name" character varying(128) NOT NULL,
                "path" character varying(255) NOT NULL,
                CONSTRAINT "PK_242a37ffc7870380f0e611986e8" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "tracks"
        `);
  }
}
