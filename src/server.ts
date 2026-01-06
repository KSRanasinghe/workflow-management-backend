import app from "./app";
import { dbPool } from "./config/db";

const PORT = process.env.PORT || 3000;


dbPool
  .query("select 1")
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection failed", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});