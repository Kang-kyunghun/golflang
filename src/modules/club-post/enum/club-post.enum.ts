export enum HandyStateEnum {
  PENDING = 'pending',
  APROVE = 'aprove',
  REJECT = 'reject',
}

export enum ClubPostCategoryEnum {
  NOTICE = 'notice',
  FREE = 'free',
  REQUEST_HANDY = 'request handy',
}

export namespace ClubPostCategoryEnum {
  export function id(type: ClubPostCategoryEnum) {
    return {
      [ClubPostCategoryEnum.NOTICE]: 1,
      [ClubPostCategoryEnum.FREE]: 2,
      [ClubPostCategoryEnum.REQUEST_HANDY]: 3,
    }[type];
  }

  export function value(id: number) {
    return {
      1: ClubPostCategoryEnum.NOTICE,
      2: ClubPostCategoryEnum.FREE,
      3: ClubPostCategoryEnum.REQUEST_HANDY,
    }[id];
  }
}
