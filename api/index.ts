import express, {type Request, type Response} from "express"
import cors from "cors"
import dotenv from "dotenv"
import database from "./database/configdb.js"
import { errorHandler } from "./middlewares/errors.middleware.js";

dotenv.config();


const app = express();
database.connect();

app.use(express.json());
app.use(cors(
  {origin: process.env.FRONTEND_URL, credentials: true}
));


app.get("/", (req: Request, res: Response) => {
  res.send({ message: "App Working" });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}/`);
  });