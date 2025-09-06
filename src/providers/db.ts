import { Database } from "bun:sqlite";

const db = new Database("data.sqlite");

export default db;
