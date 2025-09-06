export interface ITask {
  id: number;
  name: string;
  is_complete: boolean;
  repeat: boolean;
  next_execution_time: number; // timestamp
}
