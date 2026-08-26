import "dotenv/config";
import database from "./api/database/configdb.js";
import { app } from "./api/app.js";

database.connect();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}/`);
});