import 'dotenv/config' 
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import { configurePassport } from "./User/BackEnd/Config/passport.js";

import connectDB from "./User/BackEnd/Config/db.js";

import authRoutes from "./User/BackEnd/Routes/auth.routes.js";
import productRoutes from "./User/BackEnd/Routes/ProductRoutes/product.routes.js"
import adminAuthRoutes from "./User/BackEnd/Routes/Admin/admin.auth.routes.js";

import adminProductRoutes from "./User/BackEnd/Routes/Admin/admin.product.routes.js";
import cartRoutes from "./User/BackEnd/Routes/ProductRoutes/product.routes.js";

import {attachUser} from "./User/BackEnd/Middlewares/attachUser.middleware.js"

import methodOverride from "method-override";

import staticRoutes from "./User/BackEnd/Routes/static.routes.js";

import morgan from "morgan";



const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "User/BackEnd/Public")));


app.use(methodOverride("_method"));



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
app.set("views", path.join(__dirname, "User/BackEnd/Views")); 

app.set("trust proxy", 1);


app.get("/", (req, res) => {
  res.redirect("/Home"); 
});

app.use("/", authRoutes);
app.use("/",adminAuthRoutes);
app.use("/",productRoutes);

app.use("/", adminProductRoutes);

app.use("/", staticRoutes);

app.use(cartRoutes);


app.use(morgan("dev"));

app.use((req, res) => {
  res.status(404).render("errors/404");
});

const PORT = process.env.PORT || 3003;

app.listen(process.env.PORT || 3003, "0.0.0.0", () => {
  console.log("Server running");
});