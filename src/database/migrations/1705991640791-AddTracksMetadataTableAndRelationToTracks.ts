import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTracksMetadataTableAndRelationToTracks1705991640791
  implements MigrationInterface
{
  name = 'AddTracksMetadataTableAndRelationToTracks1705991640791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "tracks_metadata" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_date" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "updated_date" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying(25) NOT NULL DEFAULT 'SYSTEM',
                "deleted_date" TIMESTAMP,
                "data_version" integer NOT NULL DEFAULT '1',
                "name" character varying,
                "album" character varying,
                "artist" character varying,
                "duration" integer,
                "track_id" uuid NOT NULL,
                CONSTRAINT "REL_4fdc35f0ed7d4962e261c07044" UNIQUE ("track_id"),
                CONSTRAINT "PK_13f5998933d8c563a38936af574" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "tracks_metadata"."duration" IS 'duration in second'
        `);
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata"
            ADD CONSTRAINT "FK_4fdc35f0ed7d4962e261c070445" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tracks_metadata" DROP CONSTRAINT "FK_4fdc35f0ed7d4962e261c070445"
        `);
    await queryRunner.query(`
            DROP TABLE "tracks_metadata"
        `);
  }
}
