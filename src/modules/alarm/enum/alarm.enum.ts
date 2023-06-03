import { Club } from 'src/modules/club/entity/club.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { User } from 'src/modules/user/entity/user.entity';

export enum AlarmTypeEnum {
  Schedule = 'Schedule',
  Club = 'Club',
  Rating = 'Rating',
  Chatting = 'Chatting',
}

export namespace AlarmTypeEnum {
  export function id(type: AlarmTypeEnum) {
    return {
      [AlarmTypeEnum.Schedule]: 1,
      [AlarmTypeEnum.Club]: 2,
      [AlarmTypeEnum.Rating]: 3,
      [AlarmTypeEnum.Chatting]: 4,
    }[type];
  }

  export function value(id: number) {
    return {
      1: AlarmTypeEnum.Schedule,
      2: AlarmTypeEnum.Club,
      3: AlarmTypeEnum.Rating,
      4: AlarmTypeEnum.Chatting,
    }[id];
  }
}

type AlarmContentOption = {
  schedule?: Schedule;
  user?: User;
  club?: Club;
};

export enum AlarmContentTypeEnum {
  //Schedule
  INVITATION = 'INVITATION',
  INVITATION_APPROVE = 'INVITATION_APPROVE',
  INVITATION_REJECT = 'INVITATION_REJECT',
  APPLICATION = 'APPLICATION',
  APPLICATION_APPROVE = 'APPLICATION_APPROVE',
  APPLICATION_REJECT = 'APPLICATION_REJECT',
  SCHEDULE_UPDATE = 'SCHEDULE_UPDATE',
  SCHEDULE_DELETE = 'DELETE',
  //Club
  CLUB_JOIN = 'CLUB_JOIN',
  CLUB_JOIN_APPROVE = 'CLUB_JOIN_APPROVE',
  CLUB_JOIN_REJECT = 'CLUB_JOIN_REJECT',
  //Rating
  RATING = 'RATING',
  //Chatting
  CHATTING = 'CHATTING',
  CHATTING_REJECT = 'CHATTING_REJECT',
}

export namespace AlarmContentTypeEnum {
  export function content(
    type: AlarmContentTypeEnum,
    option: AlarmContentOption,
  ) {
    const userNickname = option.user?.nickname;
    const scheduleTitle = option.schedule?.title;
    const clubName = option.club?.name;
    return {
      [AlarmContentTypeEnum.INVITATION]: `${scheduleTitle} 일정에 초대 되었습니다.`,
      [AlarmContentTypeEnum.INVITATION_APPROVE]: `${userNickname} 님이 ${scheduleTitle} 일정을 수락 했습니다.`,
      [AlarmContentTypeEnum.INVITATION_REJECT]: `${userNickname} 님이 ${scheduleTitle} 일정을 거절 했습니다.`,
      [AlarmContentTypeEnum.APPLICATION]: `${userNickname} 님이 ${scheduleTitle} 일정 참여를 요청 했습니다.`,
      [AlarmContentTypeEnum.APPLICATION_APPROVE]: `${scheduleTitle} 일정 참여 요청이 수락 되었습니다.`,
      [AlarmContentTypeEnum.APPLICATION_REJECT]: `${scheduleTitle} 일정 참여 요청이 거절 되었습니다.`,
      [AlarmContentTypeEnum.SCHEDULE_UPDATE]: `${scheduleTitle} 일정이 업데이트 되었습니다. 확인해 주세요.`,
      [AlarmContentTypeEnum.SCHEDULE_DELETE]: `${scheduleTitle} 일정이 취소 되었습니다.`,
      [AlarmContentTypeEnum.CLUB_JOIN]: `${userNickname} 님이 ${clubName} 클럽 가입을 요청 했습니다.`,
      [AlarmContentTypeEnum.CLUB_JOIN_APPROVE]: `${clubName} 클럽 가입이 수락 되었습니다.`,
      [AlarmContentTypeEnum.CLUB_JOIN_APPROVE]: `${clubName} 클럽 가입이 거절 되었습니다.`,
      [AlarmContentTypeEnum.RATING]: `${scheduleTitle} 일정에 대해 점수를 매겨 주세요.`,
      [AlarmContentTypeEnum.CHATTING]: `${userNickname} 님께서 채팅을 요청 했습니다.`,
      [AlarmContentTypeEnum.CHATTING_REJECT]: `${userNickname} 님께서 채팅을 요청을 거절 했습니다.`,
    }[type];
  }
}
