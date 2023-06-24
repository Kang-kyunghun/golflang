export enum ClubUserStateEnum {
  PENDING = 'pending',
  APROVED = 'aproved',
  REJECTED = 'rejected',
  EXPELLED = 'expelled',
}

export namespace ClubUserStateEnum {
  export function id(type: ClubUserStateEnum) {
    return {
      [ClubUserStateEnum.PENDING]: 1,
      [ClubUserStateEnum.APROVED]: 2,
      [ClubUserStateEnum.REJECTED]: 3,
      [ClubUserStateEnum.EXPELLED]: 4,
    }[type];
  }

  export function value(id: number) {
    return {
      1: ClubUserStateEnum.PENDING,
      2: ClubUserStateEnum.APROVED,
      3: ClubUserStateEnum.REJECTED,
      4: ClubUserStateEnum.EXPELLED,
    }[id];
  }
}
