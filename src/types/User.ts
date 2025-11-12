export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNumber?: string;
  gender: boolean;
  image?: string;
  roleId: string;
  positionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNumber?: string;
  gender: string; // "1" for male, "0" for female
  roleId: string;
  positionId?: string;
}

export interface IUserUpdateInput {
  id: string;
  firstName: string;
  lastName: string;
  address?: string;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>;
}
