'use strict';

const express = require('express');
require('dotenv').config();
const pg = require('pg');


const server = express();
// comment this line when deploy to heroku
// const client = pg.Client(process.env.DATABASE_URL);

//uncomment this line when deploy to heroku
// const client = new pg.Client({connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false },});


//using port from .env file or 3001 
const PORT = process.env.PORT || 3001;

//use public folder
server.use(express.static("./public"));

//using superagent to send requests for APIs
const superagent = require("superagent");

//
server.use(express.urlencoded({ extended: true }));


// const methodOverride = require('method-override');
server.set("view engine", "ejs");
// server.use(methodOverride('_method'));



server.get('/', (req, res)=>{
  res.render("./pages/index");
});

server.get('/images', getImages);
server.post('/w', getTranslation);

function getImages(req, res){
  // let cityName = req.query.city;
  let cityName = 'paris';
  let key = process.env.CLIENT_ID;
  let URL = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${key}`;
  superagent.get(URL)
  .then(results=>{
    let arr = results.body.results.map(value => value.urls.raw);
    // res.send(arr);
    res.render('./pages/images',{arrOfImages: arr});
  })
  .catch(error=>{
    console.log("Error in getting data from Unsplash: ", error.message);
  })
}

//sentences to be translated to other languages
const sentences = [
  'Hello',
  'How are you',
  'how to go to',
  'where is the nearest restaurant',
  'my name is',
  'what is your name',
  'I am lost'
];

// https://libretranslate.com/translate?q=hello my name is AbdalQader&source=en&target=fr
function getTranslation(req, res){
  console.log('Im inside the function');
  let URL;
  let arrOfTranslations = [];
  //this is for test the api. we must get the two letter for the language of the city that the user will searh for
  let target = 'fr';
  // let value="Hello";
  sentences.forEach(value =>{
    URL = `https://libretranslate.com/translate?q=${value}&source=en&target=${target}`;
    superagent.post(URL)
    .then(result => {
      console.log(result.body.translatedText);
      arrOfTranslations.push({value: result.body.translatedText });
    })
    .catch(error=>{
      console.log("Error in getting translation data: ", error.message);
      res.send("Error in getting translation data: "+ error.message);
    })
  })
  res.render('./pages/translations', {translations:arrOfTranslations})
}


// show not found page when trying to access unfound route.
server.get("*", (req, res) => {
  // res.status(404).send('<img style="background-size:cover;" src="">');
  // let imgUrl =
  //   "https://i2.wp.com/learn.onemonth.com/wp-content/uploads/2017/08/1-10.png?w=845&ssl=1";
  // res.render("pages/error", { err: imgUrl });
  res.status(404).send("Page Not Found");
});


//connection with postgress and express servers
// client.connect().then(() => {
  server.listen(PORT, (req, res) => {
    console.log(`Listening on  PORT ${PORT} ...`);
  });
// });
