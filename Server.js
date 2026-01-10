import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./User/BackEnd/Config/passport.js";

import connectDB from "./User/BackEnd/Config/db.js";
import authRoutes from "./User/BackEnd/Routes/auth.routes.js";

import adminAuthRoutes from "./User/BackEnd/Routes/Admin/admin.auth.routes.js";


import {attachUser} from "./User/BackEnd/Middlewares/attachUser.middleware.js"
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "User/BackEnd/Public")));



app.use(
  session({
    secret: "otp-secret-key",
    resave: false,
    saveUninitialized: false
  })
);

configurePassport();

app.use(passport.initialize());
app.use(passport.session());


app.use(attachUser)




app.set("view engine", "ejs");
app.set("view cache", false);
app.set("views", "User/BackEnd/Views");


app.use("/", authRoutes);
app.use("/",adminAuthRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
