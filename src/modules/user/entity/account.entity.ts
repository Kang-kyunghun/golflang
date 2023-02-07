import { ApiProperty } from '@nestjs/swagger';
import { GuardCoreEntity } from 'src/common/entity/guard-core.entity';
import { Provider } from 'src/modules/auth/enum/account.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Account extends GuardCoreEntity {
  @Column()
  @ApiProperty({ description: '로그인 이메일' })
  email: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: '비밀번호(알파벳+숫자+특수문자) 8자리 이상',
    example: 'abcd1234!',
  })
  password: string;

  @Column({ default: false })
  @ApiProperty({ description: '현재 비밀번호가 임시비밀번호인지 여부' })
  isTempPassword: boolean;

  @Column({ type: 'enum', enum: Provider })
  @ApiProperty({ description: 'SNS 계정 공급자', enum: Provider })
  provider: Provider;

  @Column({ default: null, nullable: true })
  @ApiProperty({
    description: '암호화된 refreshToken',
    default: null,
    nullable: true,
  })
  refreshToken: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
