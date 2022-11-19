import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class UploadFile extends CoreEntity {
  @Column()
  @ApiProperty({ description: '파일명' })
  fileName: string;

  @Column()
  @ApiProperty({ description: '해쉬값' })
  hash: string;

  @Column({ nullable: true, type: 'float' })
  @ApiProperty({ description: '파일 크기', nullable: true, type: 'float' })
  size: number;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ description: '파일 가로', nullable: true, type: 'float' })
  width: number;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ description: '파일 세로', nullable: true, type: 'float' })
  height: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'AWS S3에 저장된 URL' })
  url: string;

  @OneToOne(() => User, (user) => user.thumbnail)
  userThumbnail: User;
}
