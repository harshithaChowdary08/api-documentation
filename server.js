const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "supersecretkey", // change in production
  resave: false,
  saveUninitialized: true
}));

// Serve public files like login.html, CSS, JS
app.use(express.static(path.join(__dirname, "public")));

// Middleware to check login
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

// Redirect root to login page
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Handle login POST
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded user
  if (username === "admin" && password === "password123") {
    req.session.user = username;
    res.redirect("/docs"); // redirect to protected docs after login
  } else {
    res.send("❌ Invalid credentials. <a href='/login.html'>Try again</a>");
  }
});

// Protected Swagger docs
app.get("/docs", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "protected/index.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login.html");
});

// Catch-all to redirect unauthorized access
app.use((req, res, next) => {
  if (!req.session.user && req.path !== "/login.html" && req.path !== "/login") {
    return res.redirect("/login.html");
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 OpenAPI Viewer with Login running at http://localhost:${PORT}`);
});
