import type { IUserTask } from "../interfaces/userTask";

export class UserTask implements IUserTask {
  task_id: number;
  user_id: number;
  is_complete: boolean;

  constructor(task_id: number, user_id: number, is_complete: boolean) {
    this.task_id = task_id;
    this.user_id = user_id;
    this.is_complete = is_complete;
  }
}
