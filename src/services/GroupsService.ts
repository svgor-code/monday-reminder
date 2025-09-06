import { Group } from "../entities/Group";
import { User } from "../entities/User";
import { UserGroup } from "../entities/UserGroup";
import type { ICreateUser } from "../interfaces/user";
import type { DatabaseService } from "./DatabaseService";

export class GroupsService {
  constructor(private readonly dbService: DatabaseService) { }

  getGroup(group_id: number | bigint) {
    const query = this.dbService.db.query(`SELECT * FROM groups WHERE id = ${group_id}`).as(Group);
    const group = query.get();

    if (!group) {
      throw new Error(`GroupsService: Group ${group_id} is not found`);
    }

    return group;
  }

  deleteGroup(group_id: number | bigint) {
    const deleteGroupResult = this.dbService.db.exec(`DELETE FROM groups WHERE id = ${group_id}`);
    const deleteUserGroupResult = this.dbService.db.exec(`DELETE FROM user_groups WHERE group_id = ${group_id}`);

    return Boolean(deleteGroupResult.changes) && Boolean(deleteUserGroupResult.changes);
  }

  createGroup(users: ICreateUser[]) {
    if (!users.length) {
      throw new Error("GroupsService: users is required for group creation");
    }

    const createTx = this.dbService.db.transaction((users: ICreateUser[]) => {
      const insertGroupResult = this.dbService.db.run(`INSERT INTO groups DEFAULT VALUES`);
      const group_id = insertGroupResult.lastInsertRowid;

      const findUser = this.dbService.db.prepare(
        "SELECT id FROM users WHERE username = ?"
      );
      const insertUser = this.dbService.db.prepare(`INSERT iNTO users (username, name) VALUES (?, ?)`);
      const insertUserGroup = this.dbService.db.prepare(`INSERT iNTO user_groups (group_id, user_id) VALUES (?, ?)`);

      for (const user of users) {
        let user_id: number | bigint | null;
        const existingUser = findUser.get(user.username) as { id: number | bigint } | undefined;

        if (!existingUser) {
          const insertUserResult = insertUser.run(user.username, `${user.first_name} ${user.last_name}`);
          user_id = insertUserResult.lastInsertRowid;
        } else {
          user_id = existingUser.id;
        }

        insertUserGroup.run(group_id, user_id);
      }

      return group_id;
    });

    const txResult = createTx(users);
    return txResult as number | bigint;
  }

  getGroupUsers(group_id: number | bigint) {
    const query = this.dbService.db.query(`SELECT * FROM user_groups WHERE group_id = ${group_id}`).as(UserGroup);
    const userGroups = query.all();

    return userGroups;
  }

  addUserToGroup(group_id: number | bigint, user_id: number | bigint) {
    const createNewUserGroup = this.dbService.db.exec(
      `INSERT INTO user_groups (group_id, user_id) VALUES (${group_id}, ${user_id})`
    );

    if (!createNewUserGroup.changes) {
      throw new Error("GroupsService: UserGroup was not created");
    }

    return true;
  }

  deleteUserFromGroup(group_id: number | bigint, user_id: number | bigint) {
    this.dbService.db.exec(
      `DELETE FROM user_groups WHERE user_id = ${user_id} AND group_id = ${group_id}`
    );

    const groupUsers = this.getGroupUsers(group_id);

    if (!groupUsers.length) {
      this.deleteGroup(group_id);
    }

    return true;
  }

  getUser(user_id: number | bigint) {
    const query = this.dbService.db.query(`SELECT * FROM users WHERE id = ${user_id}`).as(User);
    return query.get();
  }

  createUser(user: ICreateUser) {
    const stmt = this.dbService.db.prepare("INSERT INTO users (username, name) VALUES (?, ?)")
    const createNewUserResult = stmt.run(user.username, `${user.first_name} ${user.last_name}`);

    if (!createNewUserResult.changes) {
      throw new Error("GroupsService: User was not created");
    }

    return createNewUserResult.lastInsertRowid;
  }

  deleteUser(user_id: number | bigint) {
    const stmt = this.dbService.db.prepare("DELETE FROM users WHERE id = ?");
    const deleteUserResult = stmt.run(user_id);

    return Boolean(deleteUserResult.changes);
  }
}
