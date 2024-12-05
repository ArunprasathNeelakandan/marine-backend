const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const { initializeDb } = require('./db');
const fileRouter = require('./routers/fileRouter.js');
const authRouter = require('./routers/authRouter.js');
const app = express();
const path = require('path')
const port = 3000;

// Middleware to parse JSON body
app.use(bodyParser.json());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Use the routers
app.use(cors())
app.use('/file', fileRouter);
app.use('/admin', authRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

