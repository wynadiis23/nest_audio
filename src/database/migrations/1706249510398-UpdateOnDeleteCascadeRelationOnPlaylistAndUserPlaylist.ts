import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOnDeleteCascadeRelationOnPlaylistAndUserPlaylist1706249510398
  implements MigrationInterface
{
  name = 'UpdateOnDeleteCascadeRelationOnPlaylistAndUserPlaylist1706249510398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_playlist" DROP CONSTRAINT "FK_55f715ff39128c149b944cb66a3"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist" DROP CONSTRAINT "FK_78c541724706e156ef0bd6ab7e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist"
            ADD CONSTRAINT "FK_55f715ff39128c149b944cb66a3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist"
            ADD CONSTRAINT "FK_78c541724706e156ef0bd6ab7e1" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "user_playlist"
            ADD CONSTRAINT "FK_78c541724706e156ef0bd6ab7e1" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_playlist"
            ADD CONSTRAINT "FK_55f715ff39128c149b944cb66a3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
