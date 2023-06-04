export enum ParticipationTypeEnum {
  INVITATION = 'INVITATION',
  APPLICATION = 'APPLICATION',
}

export namespace ParticipationTypeEnum {
  export function id(type: ParticipationTypeEnum) {
    return {
      [ParticipationTypeEnum.INVITATION]: 1,
      [ParticipationTypeEnum.APPLICATION]: 2,
    }[type];
  }

  export function value(id: number) {
    return {
      1: ParticipationTypeEnum.INVITATION,
      2: ParticipationTypeEnum.APPLICATION,
    }[id];
  }
}

export enum ParticipationStateEnum {
  PENDING = 'PENDING',
  CONFIRM = 'CONFIRM',
  REJECT = 'REJECT',
}

export namespace ParticipationStateEnum {
  export function id(state: ParticipationStateEnum) {
    return {
      [ParticipationStateEnum.PENDING]: 1,
      [ParticipationStateEnum.CONFIRM]: 2,
      [ParticipationStateEnum.REJECT]: 3,
    }[state];
  }

  export function value(id: number) {
    return {
      1: ParticipationStateEnum.PENDING,
      2: ParticipationStateEnum.CONFIRM,
      3: ParticipationStateEnum.REJECT,
    }[id];
  }
}
