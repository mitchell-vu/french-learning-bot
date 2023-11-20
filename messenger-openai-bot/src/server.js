'use strict';

import { json, urlencoded } from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';

import viewEngine from './configs/viewEngine';
import webRoutes from './routes/web';

dotenv.config();

const app = express();

// Parse application/json
// Parse application/x-www-form-urlencoded
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'));

// Config view engine
viewEngine(app);

// Config web routes
webRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`App is running at http://localhost:${port}`);
  } else {
    console.log(`App is running at port ${port}`);
  }
});
