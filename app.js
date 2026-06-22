// // Core Module
// const path = require('path');

// // External Module
// const express = require('express');
// const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const { default: mongoose } = require('mongoose');

// const DB_PATH = "mongodb+srv://suryachauhan6607_db_user:test1234@cluster0.kitiywg.mongodb.net/airbnb?retryWrites=true&w=majority&appName=Cluster0";

// // Local Module
// const storeRouter = require("./routes/storeRouter");
// const hostRouter = require("./routes/hostRouter");
// const authRouter = require("./routes/authRouter");
// const rootDir = require("./utils/pathUtil");
// const errorsController = require("./controllers/errors");

// const app = express();

// app.set('view engine', 'ejs');
// app.set('views', 'views');

// const store = new MongoDBStore({
//   uri: DB_PATH,
//   collection: 'sessions'
// });

// // 1️⃣ Parse form data — must come first
// app.use(express.urlencoded({ extended: true }));

// // 2️⃣ Serve static files (CSS, JS, images)
// app.use(express.static(path.join(rootDir, 'public')));

// // 3️⃣ Session middleware — creates req.session
// app.use(session({
//   secret: "KnowledgeGate AI with Complete Coding",
//   resave: false,
//   saveUninitialized: true,
//   store
// }));

// // 4️⃣ Make isLoggedIn & user available in EVERY EJS template automatically
// app.use((req, res, next) => {
//   res.locals.isLoggedIn = req.session.isLoggedIn || false;
//   res.locals.user       = req.session.user || null;
//   next();
// });

// // 5️⃣ Routes
// app.use(authRouter);
// app.use(storeRouter);

// // 6️⃣ Protect /host routes — must be logged in
// app.use("/host", (req, res, next) => {
//   if (req.session.isLoggedIn) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// });
// app.use("/host", hostRouter);

// // 7️⃣ 404 handler — always last
// app.use(errorsController.pageNotFound);

// const PORT = 3003;

// mongoose.connect(DB_PATH).then(() => {
//   console.log('Connected to Mongo');
//   app.listen(PORT, () => {
//     console.log(`Server running on address http://localhost:${PORT}`);
//   });
// }).catch(err => {
//   console.log('Error while connecting to Mongo: ', err);
// });
// Core Module
// Core Module
// 
require('dotenv').config();
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const DB_PATH = process.env.DB_PATH;

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = MongoStore.create({
  mongoUrl: DB_PATH,
  collectionName: 'sessions'
});

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const multerOptions = {
  storage, fileFilter
};

app.use(express.urlencoded());
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')))
app.use("/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/homes/uploads", express.static(path.join(rootDir, 'uploads')))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  req.isLoggedIn = req.session.isLoggedIn || false; // keep this too, since /host guard uses it
  next();
})

app.use(authRouter)
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);
const PORT = process.env.PORT || 3004;

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});