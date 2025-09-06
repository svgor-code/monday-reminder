import { Database } from "bun:sqlite";

export class DatabaseService {
  db: Database;
  static #instance: DatabaseService;

  constructor(isTest?: boolean) {
    if (isTest) {
      this.db = new Database(":memory:");
    } else {
      this.db = new Database("data.sqlite");
    }
  }

  public static getInstance(isTest?: boolean) {
    if (!DatabaseService.#instance) {
      DatabaseService.#instance = new DatabaseService(isTest);
    }

    return DatabaseService.#instance;
  }

  public init() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        name TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        is_complete INTEGER NOT NULL,
        repeat INTEGER NOT NULL,
        next_execution_time INTEGER NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_groups (
        user_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(group_id) REFERENCES groups(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_tasks (
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        is_complete INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(task_id) REFERENCES tasks(id)
      )
    `);
  }
}
