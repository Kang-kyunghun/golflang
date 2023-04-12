export enum PermissionRole {
  PUBLIC = 'public',
  ADMIN = 'admin',
  USER = 'user',
}

export enum InvitationState {
  PENDING = 'pending',
  CONFIRM = 'confirm',
  REJECT = 'reject',
}

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
