import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRelationTrackAndPlaylistContentOnDelete1705557601085
  implements MigrationInterface
{
  name = 'UpdateRelationTrackAndPlaylistContentOnDelete1705557601085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_de0f0175f4b12324dd058ff4f99"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_de0f0175f4b12324dd058ff4f99" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_de0f0175f4b12324dd058ff4f99"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_de0f0175f4b12324dd058ff4f99" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
