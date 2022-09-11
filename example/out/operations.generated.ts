/* eslint-disable */
import * as schemas from "./schemas.generated.js";

export namespace GetUsersUserId {
  export const method = "get";
  export const path = "/users/{userId}";
  export type PathParameters = { userId: number };
  export type QueryParameters = void;
  export type RequestTypes = void;
  export type ResponseTypes = { 200: schemas.User } & { 404: void };
}

export namespace PatchUsersUserId {
  export const method = "patch";
  export const path = "/users/{userId}";
  export type PathParameters = { userId: number };
  export type QueryParameters = void;
  export type RequestTypes = {
    "application/json": {
      firstName?: string;
      lastName?: string;
      email?: string;
      dateOfBirth?: string;
    };
  };
  export type ResponseTypes = { 200: schemas.User } & { 404: void } & {
    409: void;
  };
}

export namespace PostUser {
  export const method = "post";
  export const path = "/user";
  export type PathParameters = void;
  export type QueryParameters = void;
  export type RequestTypes = {
    "application/json": {
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth: string;
    };
  };
  export type ResponseTypes = { 200: schemas.User } & { 400: void } & {
    409: void;
  };
}

export namespace GetFoo {
  export const method = "get";
  export const path = "/foo";
  export type PathParameters = void;
  export type QueryParameters = void;
  export type RequestTypes = void;
  export type ResponseTypes = { 200: schemas.Foo };
}
