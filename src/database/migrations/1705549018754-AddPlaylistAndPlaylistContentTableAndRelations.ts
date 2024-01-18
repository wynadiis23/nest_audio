import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaylistAndPlaylistContentTableAndRelations1705549018754
  implements MigrationInterface
{
  name = 'AddPlaylistAndPlaylistContentTableAndRelations1705549018754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "playlist" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "name" character varying(128) NOT NULL,
                CONSTRAINT "PK_538c2893e2024fabc7ae65ad142" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "playlist_content" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "track_name" character varying(255) NOT NULL,
                "track_id" character varying NOT NULL,
                "playlist_id" uuid NOT NULL,
                CONSTRAINT "PK_b92302a5c24f36383de1a5b96d1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_a36248ddf194db3ed7309cc537f" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_a36248ddf194db3ed7309cc537f"
        `);
    await queryRunner.query(`
            DROP TABLE "playlist_content"
        `);
    await queryRunner.query(`
            DROP TABLE "playlist"
        `);
  }
}
