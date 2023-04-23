import { ApiProperty } from '@nestjs/swagger';
import {
  OneToMany,
  Column,
  JoinColumn,
  Entity,
  OneToOne,
  ManyToOne,
} from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { ClubPost } from './club-post.entity';

@Entity()
export class ClubPostImage extends CoreEntity {
  @ManyToOne(() => ClubPost, (post) => post.images)
  clubPost: ClubPost;

  @OneToOne(() => UploadFile, (uploadFile) => uploadFile.clubPostImage)
  @JoinColumn()
  clubPostImage: UploadFile;
}
