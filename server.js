'use strict';

const express = require('express');
require('dotenv').config();
const pg = require('pg');


const server = express();
// comment this line when deploy to heroku
// const client = pg.Client(process.env.DATABASE_URL);

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


server.get('/', (req, res)=>{
  res.render("./pages/index");
})


server.get('/aboutus2', (req, res)=>{
  res.render("./pages/aboutus2");
})


// show not found page when trying to access unfound route.
server.get("*", (req, res) => {
  // res.status(404).send('<img style="background-size:cover;" src="">');
  let imgUrl =
    "https://i2.wp.com/learn.onemonth.com/wp-content/uploads/2017/08/1-10.png?w=845&ssl=1";
  res.render("pages/error", { err: imgUrl });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Added by esraa check hotels API
//first API

// rapidapi-key=${Hotel_key}
// https://hotels4.p.rapidapi.com/locations/search?rapidapi-key=01a8aff1d7msh1f0d2d85c237f29p1a75bcjsn06f796ce0b6e&query=amman

//second API

// test.api.amadeus.com





//connection with postgress and express servers
// client.connect().then(() => {
  server.listen(PORT, (req, res) => {
    console.log(`Listening on  PORT ${PORT} ...`);
  });
// });


