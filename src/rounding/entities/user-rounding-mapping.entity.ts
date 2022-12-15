import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { InvitationState } from 'src/common/enum/common.enum';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Rounding } from './rounding.entity';

@Entity()
export class UserRoundingMapping extends CoreEntity {
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Rounding, (rounding) => rounding.id)
  @JoinColumn()
  rounding: Rounding;

  @Column()
  @ApiProperty({ description: '주최자 여부' })
  isHost: boolean;

  @Column({
    type: 'enum',
    enum: InvitationState,
    default: InvitationState.PENDING,
  })
  @ApiProperty({
    description: '초대 진행 상태',
    enum: InvitationState,
    default: InvitationState.PENDING,
  })
  invitationState: InvitationState;
}
