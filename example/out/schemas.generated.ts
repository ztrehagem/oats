/* eslint-disable */
export type Foo = { foo: string };
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  emailVerified: boolean;
  createDate?: string;
  foo?: Foo;
};
