import { DateTime } from "luxon";
import type { ITask, Repeat } from "../interfaces/task";

export class Task implements ITask {
  id: number;
  name: string;
  repeat: Repeat;
  time: string;
  timezone: string;
  day?: number;
  month?: number;
  next_execution_time: number;

  constructor(
    id: number,
    name: string,
    repeat: Repeat,
    time: string,
    timezone: string,
    day?: number,
    month?: number
  ) {
    this.id = id;
    this.name = name;
    this.repeat = repeat;
    this.time = time;
    this.timezone = timezone;
    this.day = day;
    this.month = month;
    this.next_execution_time = 0;

    this.moveNextExecutionTime();
  }

  moveNextExecutionTime() {
    if (!this.next_execution_time) {
      this.next_execution_time = this.calculateNextExecutionTime();
    }

    let next = DateTime.fromMillis(this.next_execution_time).setZone(this.timezone);

    if (next <= DateTime.now().setZone(this.timezone)) {
      switch (this.repeat) {
        case 'none':
          next = next.plus({ days: 1 });
          break;
        case 'daily':
          next = next.plus({ days: 1 });
          break;
        case 'weekly':
          next = next.plus({ weeks: 1 });
          break;
        case 'monthly':
          next = next.plus({ months: 1 });
          break;
        case 'yearly':
          next = next.plus({ years: 1 });
          break;
        case 'weekdays':
          do {
            next = next.plus({ days: 1 });
          } while ([6, 7].includes(next.weekday)); // 6 = Saturday, 7 = Sunday
          break;
      }
    }

    if (this.repeat === 'weekdays' && [6, 7].includes(next.weekday)) {
      do {
        next = next.plus({ days: 1 });
      } while ([6, 7].includes(next.weekday)); // 6 = Saturday, 7 = Sunday
    }

    this.setExecutionTime(next.toMillis());
  }

  private setExecutionTime(time: number) {
    this.next_execution_time = time;
  }

  private calculateNextExecutionTime() {
    if (this.repeat === 'weekly' && !this.day) {
      throw new Error("For weekly period the weekday is required");
    }

    if (this.repeat === 'monthly' && !this.day) {
      throw new Error("For montly period the day field is required");
    }

    if (this.repeat === 'yearly' && (!this.day || !this.month)) {
      throw new Error("For montly period fields day and month are required");
    }

    const [hours, minutes] = this.time.split(':').map(Number);
    let next_execution_time = DateTime.now().setZone(this.timezone).set({ hour: hours, minute: minutes });

    if (this.repeat === 'weekly' && this.day) {
      const currentWeekday = next_execution_time.weekday;

      if (this.day > currentWeekday) {
        next_execution_time = next_execution_time.plus({ days: this.day - currentWeekday });
      } else if (this.day < currentWeekday) {
        next_execution_time = next_execution_time.plus({ days: 7 - (currentWeekday - this.day) });
      }
    }

    if (this.repeat === 'monthly') {
      next_execution_time = next_execution_time.set({ day: this.day });
    }

    if (this.repeat === 'yearly') {
      next_execution_time = next_execution_time.set({ day: this.day, month: this.month });
    }

    return next_execution_time.toMillis();
  }
}
