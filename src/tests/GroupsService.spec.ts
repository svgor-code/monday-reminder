import { beforeAll, expect, describe, test, afterAll } from 'bun:test';
import { DatabaseService } from '../services/DatabaseService';
import { GroupsService } from '../services/GroupsService';
import type { ICreateUser } from '../interfaces/user';

describe('GroupsService', () => {
  let databaseService: DatabaseService;
  let groupsService: GroupsService;

  const newUser: ICreateUser = {
    username: 'testusername',
    first_name: 'Tom',
    last_name: 'Doe',
  };

  const testUsers: ICreateUser[] = [
    { username: 'svgor', first_name: 'Konstantin', last_name: 'Troitskii' },
    { username: 'pollylnd', first_name: 'Polina', last_name: 'Rudnitskaya' },
  ];

  beforeAll(() => {
    databaseService = DatabaseService.getInstance(true);
    databaseService.init();
    groupsService = new GroupsService(databaseService);
  });

  test('should create group and add all group users to group', () => {
    const group_id = groupsService.createGroup(testUsers);
    const group = groupsService.getGroup(group_id);
    const group_users = groupsService.getGroupUsers(group_id);

    expect(group).toBeDefined();
    expect(group_users.length).toBe(2);
  });

  test('should create user', () => {
    const user_id = groupsService.createUser(newUser);
    const user = groupsService.getUser(user_id);
    expect(user).toBeDefined();
  });

  test('should get user by id', () => {
    const user_id = groupsService.createUser(newUser);
    const user = groupsService.getUser(user_id);

    expect(user?.username).toBe(newUser.username);
    expect(user?.name).toBe(`${newUser.first_name} ${newUser.last_name}`);
  });

  test('should delete user', () => {
    const user_id = groupsService.createUser(newUser);
    const deleteResult = groupsService.deleteUser(user_id);

    expect(deleteResult).toBeTrue();
    const deletedUser = groupsService.getUser(user_id)
    expect(deletedUser).toBe(null);
  });

  test('should add user to group', () => {
    const group_id = groupsService.createGroup(testUsers);
    const user_id = groupsService.createUser(newUser);

    const isComplete = groupsService.addUserToGroup(group_id, user_id);
    expect(isComplete).toBeTrue();

    const group_users = groupsService.getGroupUsers(group_id);
    const isUserInGroup = group_users.some((u) => u.user_id === user_id);

    expect(isUserInGroup).toBeTrue();
  });

  test('should delete user from group', () => {
    const group_id = groupsService.createGroup(testUsers);
    const group_users = groupsService.getGroupUsers(group_id);
    const user = group_users[0];

    if (!user) {
      throw new Error("user not found");
    }

    const user_id = user.user_id;

    groupsService.deleteUserFromGroup(group_id, user_id);
    const new_group_users = groupsService.getGroupUsers(group_id);

    expect(new_group_users.find((u) => u.user_id === user_id)).toBeUndefined();
  });

  test('should delete group', () => {
    const group_id = groupsService.createGroup(testUsers);
    const deleteGroupResult = groupsService.deleteGroup(group_id);

    expect(deleteGroupResult).toBeTrue();
  })

  afterAll(() => {
    databaseService.db.close();
  });
})

