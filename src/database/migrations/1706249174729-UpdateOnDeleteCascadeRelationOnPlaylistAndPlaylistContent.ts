import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOnDeleteCascadeRelationOnPlaylistAndPlaylistContent1706249174729
  implements MigrationInterface
{
  name =
    'UpdateOnDeleteCascadeRelationOnPlaylistAndPlaylistContent1706249174729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_a36248ddf194db3ed7309cc537f"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_a36248ddf194db3ed7309cc537f" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "playlist_content" DROP CONSTRAINT "FK_a36248ddf194db3ed7309cc537f"
        `);
    await queryRunner.query(`
            ALTER TABLE "playlist_content"
            ADD CONSTRAINT "FK_a36248ddf194db3ed7309cc537f" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
