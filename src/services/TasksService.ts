import { Task } from "../entities/Task";
import { UserTask } from "../entities/UserTask";
import type { ICreateTask } from "../interfaces/task";
import type { IUserGroup } from "../interfaces/userGroup";
import type { DatabaseService } from "./DatabaseService";
import type { GroupsService } from "./GroupsService";

export class TasksService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly groupsService: GroupsService
  ) { }

  getTask(task_id: number | bigint) {
    const query = this.dbService.db.query(`SELECT * FROM tasks WHERE id = ${task_id}`).as(Task);
    const task = query.get();

    if (!task) {
      throw new Error(`TasksService: Task ${task_id} is not found`);
    }

    return task;
  }

  createTask(newTask: ICreateTask, group_id: number | bigint) {
    const users = this.groupsService.getGroupUsers(group_id);

    if (!users.length) {
      return;
    }

    const createTx = this.dbService.db.transaction((users: IUserGroup[]) => {
      const insertTask = this.dbService.db.prepare("INSERT INTO tasks (name, repeat, next_execution_time) VALUES (?, ?, ?)");
      const createNewTaskResult = insertTask.run(newTask.name, newTask.repeat, 0);
      const task_id = createNewTaskResult.lastInsertRowid;

      if (!createNewTaskResult.changes) {
        throw new Error("TasksService: Task was not created");
      }

      const insertUserTasks = this.dbService.db.prepare("INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)");

      for (const user of users) {
        insertUserTasks.run(user.user_id, task_id);
      }

      return task_id;
    });


    return createTx(users);
  }

  getUserTasks(user_id: number | bigint) {
    const query = this.dbService.db.query(`SELECT * FROM user_tasks WHERE user_id = ${user_id}`).as(UserTask);
    const userTasks = query.all();

    return userTasks.map((ut) => ({ ...ut, is_complete: Boolean(ut.is_complete) }));
  }

  markTaskAsComplete(task_id: number | bigint, user_id: number | bigint) {
    const updateUserTask = this.dbService.db.prepare("UPDATE user_tasks SET is_complete = 1 WHERE task_id = ? AND user_id = ?");
    const updateResult = updateUserTask.run(task_id, user_id);

    return Boolean(updateResult.changes);
  }

  deleteTask(task_id: number | bigint) {
    const deleteTaskResult = this.dbService.db.exec(`DELETE FROM tasks WHERE id = ${task_id}`);
    const deleteUserTasksResult = this.dbService.db.exec(`DELETE FROM user_tasks WHERE task_id = ${task_id}`);

    return Boolean(deleteTaskResult.changes) && Boolean(deleteUserTasksResult.changes);
  }

}
