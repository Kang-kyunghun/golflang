import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Club } from 'src/modules/club/entity/club.entity';
import { ClubPostImage } from 'src/modules/club-post/entity';

@Entity()
export class UploadFile extends CoreEntity {
  @Column()
  @ApiProperty({ description: '파일명' })
  name: string;

  @Column({ nullable: true, type: 'float' })
  @ApiProperty({ description: '파일 크기', nullable: true, type: 'float' })
  size: number;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'AWS S3에 저장된 URL' })
  url: string;

  @Column()
  @ApiProperty({ description: '확장자명' })
  ext: string;

  @Column()
  @ApiProperty({ description: '확장자명' })
  mime: string;

  @Column()
  @ApiProperty({ description: '해쉬값' })
  hash: string;

  @OneToOne(() => User, (user) => user.profileImage)
  user: User;

  @OneToOne(() => Club, (club) => club.profileImage)
  club: Club;

  @OneToOne(() => ClubPostImage, (clubPostImage) => clubPostImage.clubPostImage)
  clubPostImage: ClubPostImage;
}
