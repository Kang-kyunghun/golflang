export enum ScheduleTypeEnum {
  CLUB = 'CLUB',
  PERSONAL = 'PERSONAL',
}

export namespace ScheduleTypeEnum {
  export function id(type: ScheduleTypeEnum) {
    return {
      [ScheduleTypeEnum.CLUB]: 1,
      [ScheduleTypeEnum.PERSONAL]: 2,
    }[type];
  }

  export function value(id: number) {
    return {
      1: ScheduleTypeEnum.CLUB,
      2: ScheduleTypeEnum.PERSONAL,
    }[id];
  }
}

export enum ParticipationType {
  INVITATION = 'INVITATION',
  APPLICATION = 'APPLICATION',
}

export enum ParticipationState {
  PENDING = 'PENDING',
  CONFIRM = 'CONFIRM',
  REJECT = 'REJECT',
}
