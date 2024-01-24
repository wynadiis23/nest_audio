import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPlaylistTable1706069028886 implements MigrationInterface {
  name = 'AddUserPlaylistTable1706069028886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_playlist" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "user_id" uuid NOT NULL,
                "playlist_id" uuid NOT NULL,
                "hash" character varying NOT NULL,
                CONSTRAINT "PK_49fd9ed8fc57feeb406c108a1df" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist"
            ADD CONSTRAINT "FK_55f715ff39128c149b944cb66a3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist"
            ADD CONSTRAINT "FK_78c541724706e156ef0bd6ab7e1" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_playlist" DROP CONSTRAINT "FK_78c541724706e156ef0bd6ab7e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist" DROP CONSTRAINT "FK_55f715ff39128c149b944cb66a3"
        `);
    await queryRunner.query(`
            DROP TABLE "user_playlist"
        `);
  }
}
