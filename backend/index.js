import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

await connectDB();

app.listen(env.PORT, () => {
  console.log(`Auth API listening on port ${env.PORT}`);
});
