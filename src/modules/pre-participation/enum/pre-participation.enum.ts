export enum ParticipationType {
  INVITATION = 'INVITATION',
  APPLICATION = 'APPLICATION',
}

export namespace ParticipationType {
  export function id(type: ParticipationType) {
    return {
      [ParticipationType.INVITATION]: 1,
      [ParticipationType.APPLICATION]: 2,
    }[type];
  }

  export function value(id: number) {
    return {
      1: ParticipationType.INVITATION,
      2: ParticipationType.APPLICATION,
    }[id];
  }
}

export enum ParticipationState {
  PENDING = 'PENDING',
  CONFIRM = 'CONFIRM',
  REJECT = 'REJECT',
}

export namespace ParticipationState {
  export function id(state: ParticipationState) {
    return {
      [ParticipationState.PENDING]: 1,
      [ParticipationState.CONFIRM]: 2,
      [ParticipationState.REJECT]: 3,
    }[state];
  }

  export function value(id: number) {
    return {
      1: ParticipationState.PENDING,
      2: ParticipationState.CONFIRM,
      3: ParticipationState.REJECT,
    }[id];
  }
}
