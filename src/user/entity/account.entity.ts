import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { GuardCoreEntity } from 'src/common/entity/guard-core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from '../enum/user.enum';
import { User } from './user.entity';

@Entity()
export class Account extends GuardCoreEntity {
  @Column()
  @ApiProperty({ description: '로그인 이메일' })
  email: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: '비밀번호(알파벳+숫자+특수문자 8자리 이상',
    example: 'abcd1234!',
  })
  password: string;

  @Column({ nullable: true, default: 0 })
  @ApiProperty({ description: '비밀번호 실패 횟수' })
  psFailCount: number;

  @Column({ type: 'enum', enum: Provider })
  @ApiProperty({ description: 'SNS 계정 공급자', enum: Provider })
  provider: Provider;

  @Column({ default: null, nullable: true })
  @ApiProperty({
    description: '비밀번호 찾기용 토큰',
    default: null,
    nullable: true,
  })
  psResetToken: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'account key값' })
  accountKey: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
