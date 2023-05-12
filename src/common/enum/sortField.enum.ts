type SortOrder = 1 | -1;

export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export namespace SortOrderEnum {
  export function value(sortOrder: string) {
    const asc: SortOrder = 1;
    const desc: SortOrder = -1;

    return {
      ASC: asc,
      DESC: desc,
    }[sortOrder];
  }
}

export enum UserSortField {
  NICKNAME = 'nickname',
  AGE = 'age',
  AVG_HIT_SCORE = 'avgHitScore',
}

export enum ClubMemberSortField {
  NICKNAME = 'nickname',
  AGE = 'age',
  CLUB_HIT_SCORE = 'clubHitScore',
}

export enum ClubSortField {
  NAME = 'name',
  MENNER_SCORE = 'mennerScore',
}
