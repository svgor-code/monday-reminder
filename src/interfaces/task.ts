export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays';

export interface ITask {
  id: number;
  name: string;
  repeat: Repeat;
  next_execution_time: number; // timestamp
}

export interface ICreateTask {
  name: string;
  repeat: Repeat;
}
