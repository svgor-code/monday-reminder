import type { ICreateTask, ITask, Repeat } from "../interfaces/task";

export class Task implements ITask {
  id: number;
  name: string;
  next_execution_time: number;
  repeat: Repeat;

  constructor(newTask: ICreateTask) {
    this.id = newTask.id;
    this.name = newTask.name;
    this.repeat = newTask.repeat;
    this.next_execution_time = 0;
  }

  setExecutionTime(time: number) {
    this.next_execution_time = time;
  }
}
