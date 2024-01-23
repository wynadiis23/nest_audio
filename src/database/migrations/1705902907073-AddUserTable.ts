import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTable1705902907073 implements MigrationInterface {
  name = 'AddUserTable1705902907073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "username" character varying(15) NOT NULL,
                "password" character varying NOT NULL,
                "isActive" integer NOT NULL DEFAULT '1',
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "user"
        `);
  }
}
