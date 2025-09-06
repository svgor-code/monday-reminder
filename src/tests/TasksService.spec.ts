
import { beforeAll, expect, describe, test, afterAll } from 'bun:test';
import { DatabaseService } from '../services/DatabaseService';
import { TasksService } from '../services/TasksService';
import type { ICreateTask } from '../interfaces/task';
import { GroupsService } from '../services/GroupsService';
import type { UserGroup } from '../entities/UserGroup';

const newTask: ICreateTask = {
  name: "Track your time",
  repeat: 'weekdays',
}

describe('TasksService', () => {
  let databaseService: DatabaseService;
  let groupsService: GroupsService;
  let tasksService: TasksService;
  let testGroupId: number | bigint;
  let testGroupUsers: UserGroup[];

  beforeAll(() => {
    databaseService = DatabaseService.getInstance(true);
    databaseService.init();

    groupsService = new GroupsService(databaseService);
    tasksService = new TasksService(databaseService, groupsService);

    testGroupId = groupsService.createGroup([
      { username: 'svgor', first_name: 'Konstantin', last_name: 'Troitskii' },
      { username: 'pollylnd', first_name: 'Polina', last_name: 'Rudnitskaya' },
    ]);

    testGroupUsers = groupsService.getGroupUsers(testGroupId);
  });

  test('should create new task and assign it for users from group', () => {
    const task_id = tasksService.createTask(newTask, testGroupId);
    const task = tasksService.getTask(task_id);

    expect(Number(task_id)).toBeGreaterThan(0);
    expect(task).toBeDefined();

    const userTasks = tasksService.getUserTasks(testGroupUsers[0]!.user_id);
    expect(userTasks.length > 0).toBeTrue();
    expect(userTasks.every(ut => ut.is_complete === false)).toBeTrue();
  });

  test('should mark task as complete', () => {
    const task_id = tasksService.createTask(newTask, testGroupId);
    const user_id = testGroupUsers[1]!.user_id;

    const markAsCompleteResult = tasksService.markTaskAsComplete(task_id, user_id);
    expect(markAsCompleteResult).toBeTrue();

    const userTasks = tasksService.getUserTasks(user_id);
    expect(userTasks.find(ut => ut.is_complete)?.task_id).toEqual(task_id);
    expect(userTasks.find(ut => ut.is_complete)?.user_id).toEqual(user_id);
  });

  test('should delete task', () => {
    const task_id = tasksService.createTask(newTask, testGroupId);
    const deleteTaskResult = tasksService.deleteTask(task_id);

    expect(deleteTaskResult).toBeTrue();
  })

  afterAll(() => {
  });
})

