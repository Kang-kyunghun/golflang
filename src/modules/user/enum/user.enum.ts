export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  LEADER = 'leader',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export namespace Gender {
  export function value(gender: string) {
    return {
      male: Gender.MALE,
      female: Gender.FEMALE,
    }[gender];
  }
}
