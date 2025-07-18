import express from "express";
import session from "express-session";
import flash from "connect-flash";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ejsLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import open from "open";
import fs from "fs";

// Import routes
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import clienteRouter from "./routes/cliente.js";
import comercioRouter from "./routes/comercio.js";
import deliveryRouter from "./routes/delivery.js";
import adminRouter from "./routes/admin.js";

// Import middlewares
import { checkAuthenticated } from "./middlewares/auth.js";

// Import database connection
import { sequelize } from "./models/index.js";

// Import default users
import dbInit from "./utils/db-init.js";
import handlerPromise from "./handlers/handler_promise.js";
import crearTiposComercioYComercios from "./usurio.js";
import models from "./models/index.js";
const { Comercio, TipoComercio } = models;

// Load environment variables
dotenv.config();

// Set up __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Ensure database directory exists
const dbDir = path.join(__dirname, "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Configure view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(ejsLayouts);
app.set("layout", "layouts/main");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "appcenar-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/cliente", checkAuthenticated("cliente"), clienteRouter);
app.use("/comercio", checkAuthenticated("comercio"), comercioRouter);
app.use("/delivery", checkAuthenticated("delivery"), deliveryRouter);
app.use("/admin", checkAuthenticated("admin"), adminRouter);

// Error handling
app.use((req, res) => {
  res.status(404).render("error/404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error/500");
});

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Opening browser...`);
      open(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default app;
