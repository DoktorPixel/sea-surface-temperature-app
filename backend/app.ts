// app.ts

import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import routes from "./routes";

const app = express();
const PORT = 3001;

app.use(fileUpload());
app.use(express.static(path.join(__dirname, "static")));

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
