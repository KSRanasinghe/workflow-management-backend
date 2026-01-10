import { Pool } from "pg";

export const dbPool = new Pool({
  host: "localhost",
  port: 5432,
  database: "workflow_db",
  user: "workflow_user",
  password: "workflow_pass",
});
