import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Column, Entity } from 'typeorm';
import { OtpAction } from '../enum/otp.enum';

@Entity()
export class Otp extends CoreEntity {
  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '이메일' })
  email: string;

  @Column()
  @ApiProperty({ description: 'OTP 번호' })
  otp: string;

  @Column()
  @ApiProperty({ description: '만기 날짜' })
  expireDate: Date;

  @Column({ default: 0 })
  @ApiProperty({ description: '요청 수' })
  reqCount: number;

  @Column()
  @ApiProperty({ description: 'OTP가 필요한 경우' })
  action: string;
}
