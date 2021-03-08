'use strict';

const express = require('express');
require('dotenv').config();
const pg = require('pg');


const server = express();
// comment this line when deploy to heroku
const client = new pg.Client(process.env.DATABASE_URL);

//uncomment this line when deploy to heroku
// const client = new pg.Client({connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false },});


//using port from .env file or 3001 
// const PORT = process.env.PORT || 3001;
const PORT = 5555;

//use public folder
server.use(express.static("./public"));

//using superagent to send requests for APIs
const superagent = require("superagent");

//
server.use(express.urlencoded({ extended: true }));


// const methodOverride = require('method-override');
server.set("view engine", "ejs");
// server.use(methodOverride('_method'));

//this module for hashing 
const md5 = require('md5');


server.get('/', (req, res) => {
  res.render("./pages/index");
});
// to render aboutus 
server.get('/about', (req, res)=>{
  res.render("./pages/about");
});
server.get('/login',logIn);
server.get('/signup', signUp);
server.post('/addUserToDatabase', addUser);
server.post('/checkUser', checkUser);
server.get('/search', getImages);
server.post('/sentences', getTranslation);
//Hotels API
// server.get('/hotels', getHotels);

let cityName='';
function getImages(req, res) {
  cityName = req.query.cityName;
  // let cityName = 'paris';
  let key = process.env.CLIENT_ID;
  let URL = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${key}`;
  superagent.get(URL)
    .then(results => {
      let arr = results.body.results.map(value => value.urls.raw);
      // res.send(arr);
      res.render('./pages/details', { arrOfImages: arr.slice(0, 6) , cityName: cityName});
      getHotels();
      
    })
    .catch(error => {
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
function getTranslation(req, res) {
  console.log('Im inside the function');
  let URL;
  let arrOfTranslations = [];
  //this is for test the api. we must get the two letter for the language of the city that the user will searh for
  let target = 'fr';
  // let value="Hello";
  sentences.forEach(value => {
    URL = `https://libretranslate.com/translate?q=${value}&source=en&target=${target}`;
    return superagent.post(URL)
      .then(result => {
        console.log(result.body.translatedText);
        // return result.body.translatedText
        arrOfTranslations.push({ en: value, target: result.body.translatedText });
        if (arrOfTranslations.length === sentences.length)
          res.render('./pages/translations', { translations: arrOfTranslations })
      })
      .catch(error => {
        console.log("Error in getting translation data: ", error.message);
        res.send("Error in getting translation data: " + error.message);
      })
  })
  console.log("this goes first");
}

function signUp(req, res){
  res.render('./pages/signup-page');
}

function addUser(req, res){
  let phoneNumber = req.body.phoneNumber;
  // console.log(phoneNumber);
  //this query to get the full name of the user if it is already has an account.
  let SQL = `select fname, lname from user1 where phone = '${phoneNumber}';`;

  let sql = `insert into user1 (fname, lname, phone, password) values($1,$2,$3,$4);`;
  let values = [req.body.firstName, req.body.lastName, req.body.phoneNumber, md5(req.body.password)];

  //checke whether phone number is already signed up(has an account)
  client.query(SQL)
  .then(data=>{
    console.log(data.rows);
    if(data.rows.length === 0){
      client.query(sql,values)
      .then(results=>{
        console.log('row inserted Successfully...');
        res.render('./pages/index');
      }).catch(error=> console.log("Error in inserting user: ", error.message))
    }
    else{
      res.render('./pages/error-signup',{message: "there is an account already ",fullname:`${data.rows[0].fname} ${data.rows[0].lname}`});
    }

  }).catch(error=> console.log('Error in checking whether number is already has an account: ', error.message));
}

function logIn(req, res){
  res.render('./pages/login-page',{message: '', needToSignUp:'false'});
}

function checkUser(req, res){
  let phoneNumber = req.body.phoneNumber;
  console.log(phoneNumber);
  let sql = `select password from user1 where phone = '${phoneNumber}';`;
  let password = req.body.password;
  client.query(sql)
  .then(results=>{
    console.log(results.rows);
    if(results.rows.length >0){
      let passwordDB = results.rows[0].password;
      if(md5(password) === passwordDB){
        res.render('./pages/index');
        // res.render('./pages/login-page',{message:"Wrong password",needToSignUp:'false'}
      }
      else
        res.render('./pages/login-page',{message:"Wrong password",needToSignUp:'false'});
    }else
      res.render('./pages/login-page',{message:"you need to sign up first",needToSignUp:'true'});
  })
  .catch(error=>{
    console.log('Error in getting user info from database: ', error.message);
  })
}

//get hotels details from API
function getHotels(req, res){
  let key = process.env.HOTEL_KEY;
  let url=`https://hotels4.p.rapidapi.com/locations/search?rapidapi-key=${key}&query=${cityName}`;
  // console.log(url)
  superagent.get(url)
  .then(result=>{
    // console.log(result.body.suggestions[0].entities);
    let desId = result.body.suggestions[0].entities.map(value => value.destinationId);
    // console.log(desId);
    let url2 = `https://hotels4.p.rapidapi.com/properties/list?rapidapi-key=${key}&destinationId=${desId[0]}`
    superagent.get(url2)
    .then(result2=>{

      // console.log(result2.body.data.body.searchResults.results);
      let arrOfId = result2.body.data.body.searchResults.results.map(value => value.id);
      // console.log(arrOfId);
      let url3 = `https://hotels4.p.rapidapi.com/properties/get-details?rapidapi-key=${key}&id=${arrOfId[0]}`;

      superagent.get(url3)
      .then(result3 =>{
        let hotelName = result3.body.data.body.propertyDescription.name;
        // console.log(result3.body.data.body.propertyDescription.name);
        // console.log(result3.body.data.body.overview.overviewSections[0].content);
        let content = result3.body.data.body.overview.overviewSections[0].content.join(',')
        // console.log('Content: ', content);
        let address = result3.body.data.body.propertyDescription.address.fullAddress;
        // console.log(address);
        let startRating = result3.body.data.body.propertyDescription.starRating;
        // console.log("rating: ", startRating);

        let neighborhood = result3.body.neighborhood.neighborhoodName;
        // console.log(neighborhood);

        let transportationName = result3.body.transportation.transportLocations[0].locations[0].name;
        let transportationTime = result3.body.transportation.transportLocations[0].locations[0].distanceInTime;
        // console.log(`neaest airport is: ${transportationName} and it is far from ${hotelName}: ${transportationTime}`);
        let price = result3.body.data.body.propertyDescription.featuredPrice.currentPrice.formatted;
        console.log('price: ',price );


      }).catch(error => console.log('Error in getting properties of hotels: ', error.message));

    }).catch(error => console.log('Error in getting data using des id: ', error.message))

  })
  .catch(error => console.log("Error in getting hotels data: ",error.message));
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
client.connect().then(() => {
  server.listen(PORT, (req, res) => {
    console.log(`Listening on  PORT ${PORT} ...`);
  });
});



//this function return the difference between two dates in days.
function getData(dateIn, dateOut){
  const date1 = new Date(dateIn);
  const date2 = new Date(dateOut);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // console.log(diffDays + " days");
  return diffDays;
}
