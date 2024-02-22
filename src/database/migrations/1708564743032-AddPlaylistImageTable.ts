import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaylistImageTable1708564743032 implements MigrationInterface {
  name = 'AddPlaylistImageTable1708564743032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "playlist_image" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "path" character varying(255),
                "thumb_path" character varying(255),
                "small_thumb_path" character varying(255),
                "tiny_thumb_path" character varying(255),
                "playlist_id" uuid NOT NULL,
                CONSTRAINT "REL_40bb7897462166a9af7c49195f" UNIQUE ("playlist_id"),
                CONSTRAINT "PK_03dc4cbbdaed427cedf974c557d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_image"
            ADD CONSTRAINT "FK_40bb7897462166a9af7c49195fc" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_image" DROP CONSTRAINT "FK_40bb7897462166a9af7c49195fc"
        `);
    await queryRunner.query(`
            DROP TABLE "playlist_image"
        `);
  }
}
