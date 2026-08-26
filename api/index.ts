import "dotenv/config";
import database from "./database/configdb.js";
import { app } from "./app.js";


database.connect();

export default app;