// Core Module
const path = require('path');

// External Module
const express = require('express');
const db = require('./utils/databaseUtil');

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();
db.execute('SELECT * FROM homes')
  .then(([rows,fields]) => {
    // Handle the query result
    console.log('Getting homes from DB:', rows);
  })
  .catch(err => {
    console.error('Error occurred while fetching homes:', err);
  })

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded());
app.use(storeRouter);
app.use("/host", hostRouter);

app.use(express.static(path.join(rootDir, 'public')));

app.use(errorsController.pageNotFound);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});
