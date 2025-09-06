import type { IUserGroup } from "../interfaces/userGroup";

export class UserGroup implements IUserGroup {
  group_id: number;
  user_id: number;

  constructor(group_id: number, user_id: number) {
    this.group_id = group_id;
    this.user_id = user_id;
  }
}
