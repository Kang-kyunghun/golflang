export enum ScheduleType {
  CLUB = 'CLUB',
  PERSONAL = 'PERSONAL',
}

export namespace ScheduleType {
  export function id(type: ScheduleType) {
    return {
      [ScheduleType.CLUB]: 1,
      [ScheduleType.PERSONAL]: 2,
    }[type];
  }

  export function value(id: number) {
    return {
      1: ScheduleType.CLUB,
      2: ScheduleType.PERSONAL,
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
