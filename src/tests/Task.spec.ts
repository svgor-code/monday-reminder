import { beforeAll, expect, describe, test, afterAll } from 'bun:test';
import { DateTime, Settings } from 'luxon';
import { Task } from '../entities/Task';


describe('Task Entity', () => {
  const fixedNow = DateTime.fromISO("2025-09-06T10:00:00", { zone: "UTC" }).toMillis(); // Saturday (6)

  beforeAll(() => {
    Settings.now = () => fixedNow;
  });

  test('repeat=daily should set time on today if it in the future', () => {
    const task = new Task(1, "Test daily", 'daily', '12:00', 'UTC');
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 12, minute: 0 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=daily should set time on tomorrow if it in the past', () => {
    const task = new Task(2, "Test daily", 'daily', '08:00', 'UTC');
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 8, minute: 0 }).plus({ days: 1 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekly should set time on today if it in the future', () => {
    const task = new Task(2, "Test weekly", 'weekly', '12:00', 'UTC', 6);
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 12, minute: 0 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekly should set time to next week if it today in past', () => {
    const task = new Task(2, "Test weekly", 'weekly', '08:00', 'UTC', 6);
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 8, minute: 0 }).plus({ days: 7 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekly should set time to current week if the day in the future for the week', () => {
    const task = new Task(2, "Test weekly", 'weekly', '08:00', 'UTC', 7);
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 8, minute: 0 }).plus({ days: 1 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekly should set time to next week if the day in the past for the week', () => {
    const task = new Task(2, "Test weekly", 'weekly', '08:00', 'UTC', 5);
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 8, minute: 0 }).plus({ days: 6 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekly should set time to next month if the day in the past for the current month', () => {
    const task = new Task(2, "Test monthly", 'monthly', '12:00', 'UTC', 5);
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 12, minute: 0 }).plus({ month: 1 }).minus({ days: 1 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekly should set time to current month if the day in the future', () => {
    const task = new Task(2, "Test monthly", 'monthly', '12:00', 'UTC', 7);
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 12, minute: 0 }).plus({ days: 1 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  test('repeat=weekdays should set time to next hard work day', () => {
    const task = new Task(2, "Test weekdays", 'weekdays', '12:00', 'UTC');
    const expected = DateTime.fromMillis(fixedNow).set({ hour: 12, minute: 0 }).plus({ days: 2 }).toMillis();
    expect(task.next_execution_time).toEqual(expected);
  });

  afterAll(() => {
    Settings.now = () => Date.now();
  })
})

