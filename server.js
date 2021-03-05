'use strict';

const express = require('express');
require('dotenv').config();
const pg = require('pg');


const server = express();
// comment this line when deploy to heroku
const client = pg.Client(process.env.DATABASE_URL);

//uncomment this line when deploy to heroku
// const client = new pg.Client({connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false },});


const PORT = process.env.PORT || 3001;

//use public folder
server.use(express.static("./public"));


const superagent = require("superagent");

//
server.use(express.urlencoded({ extended: true }));


const methodOverride = require('method-override');
server.set("view engine", "ejs");
server.use(methodOverride('_method'));





// show not found page when trying to access unfound route.
server.get("*", (req, res) => {
  // res.status(404).send('<img style="background-size:cover;" src="">');
  let imgUrl =
    "https://i2.wp.com/learn.onemonth.com/wp-content/uploads/2017/08/1-10.png?w=845&ssl=1";
  res.render("pages/error", { err: imgUrl });
});


//connection with postgress and express servers
client.connect().then(() => {
  server.listen(PORT, (req, res) => {
    console.log(`Listening on  PORT ${PORT} ...`);
  });
});


