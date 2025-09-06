import type { IUser } from "../interfaces/user";

export class User implements IUser {
  id: number;
  name: string;
  username: string;

  constructor(id: number, name: string, username: string) {
    this.id = id;
    this.name = name;
    this.username = username;
  }
}
