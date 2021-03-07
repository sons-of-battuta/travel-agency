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



server.get('/', (req, res) => {
  res.render("./pages/index");
});
// to render aboutus 
server.get('/about', (req, res)=>{
  res.render("./pages/about");
});

// server.get('/search', getImages);
// server.post('/sentences', getTranslation);

// function getImages(req, res) {
//   let cityName = req.query.cityName;
//   // let cityName = 'paris';
//   let key = process.env.CLIENT_ID;
//   let URL = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${key}`;
//   superagent.get(URL)
//     .then(results => {
//       let arr = results.body.results.map(value => value.urls.raw);
//       // res.send(arr);
//       res.render('./pages/details', { arrOfImages: arr.slice(0, 6) });
//     })
//     .catch(error => {
//       console.log("Error in getting data from Unsplash: ", error.message);
//     })
// }

// //sentences to be translated to other languages
// const sentences = [
//   'Hello',
//   'How are you',
//   'how to go to',
//   'where is the nearest restaurant',
//   'my name is',
//   'what is your name',
//   'I am lost'
// ];

// // https://libretranslate.com/translate?q=hello my name is AbdalQader&source=en&target=fr
// function getTranslation(req, res) {
//   console.log('Im inside the function');
//   let URL;
//   let arrOfTranslations = [];
//   //this is for test the api. we must get the two letter for the language of the city that the user will searh for
//   let target = 'fr';
//   // let value="Hello";
//   sentences.forEach(value => {
//     URL = `https://libretranslate.com/translate?q=${value}&source=en&target=${target}`;
//     return superagent.post(URL)
//       .then(result => {
//         console.log(result.body.translatedText);
//         // return result.body.translatedText
//         arrOfTranslations.push({ en: value, target: result.body.translatedText });
//         if (arrOfTranslations.length === sentences.length)
//           res.render('./pages/translations', { translations: arrOfTranslations })
//       })
//       .catch(error => {
//         console.log("Error in getting translation data: ", error.message);
//         res.send("Error in getting translation data: " + error.message);
//       })
//   })
//   console.log("this goes first");
// }


// // show not found page when trying to access unfound route.
// server.get("*", (req, res) => {
//   // res.status(404).send('<img style="background-size:cover;" src="">');
//   // let imgUrl =
//   //   "https://i2.wp.com/learn.onemonth.com/wp-content/uploads/2017/08/1-10.png?w=845&ssl=1";
//   // res.render("pages/error", { err: imgUrl });
//   res.status(404).send("Page Not Found");
// });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//try hotels API

{/* 
<form action="/search" method="GET">
    <input type="text" placeholder="Search City" id="search_input" name="cityName">
    <button id="search-button">Search</button>
</form>
</section> */}

server.get('/search',(req,res) =>{
  let key=process.env.Hotel_key;
  let cityName=req.query.cityName;
  // console.log(req.query);
  let url=`https://hotels4.p.rapidapi.com/locations/search?rapidapi-key=${key}&query=${cityName}`;
  // console.log(url)
  
  superagent.get (url)
  .then (hotelsResult =>{
  // console.log(hotelsResult.body.suggestions[0]);
  // console.log("Sugessions",hotelsResult.body.suggestions);
  // alert("Im in ")
  // console.log(hotelsResult.body.suggestions[0].entities);
  let hotelsArr=hotelsResult.body.suggestions[0].entities.map(element => new hotel (element));
  // console.log(hotelsArr);
  res.render('pages/cityhotels',{hotelsList:hotelsArr});
  })
  .catch(error=>{
    console.log("Error in getting hotels data",error.message);
  })
  })
function hotel(hotelData) {
  // this.name =hotelData.group.name;
  // this.geoId =hotelData.group.entities[0].geoId;
  // this.destinationId =hotelData.group.entities[0].destinationId;
  // this.caption =hotelData.group.entities[0].caption;
  // this.latitude =hotelData.group.entities[0].latitude;
  // this.longitude =hotelData.group.entities[0].longitude;
  this.name =hotelData.name;
  this.geoId =hotelData.geoId;
  this.destinationId =hotelData.destinationId;
  this.caption =hotelData.caption;
  this.latitude =hotelData.latitude;
  this.longitude =hotelData.longitude;

  
//   "geoId": "6269089",
// "destinationId": "1771423",
// "landmarkCityDestinationId": null,
// "type": "CITY",
// "redirectPage": "DEFAULT_PAGE",
// "latitude": 31.965116,
// "longitude": 35.899227,
// "caption": "<span class='highlighted'>Amman</span>, Amman Governorate, Jordan",
// "name": "Amman
  
  
}


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

//*****************getting destinationId & id*********************//

//get from location ==>>>destinationId=
//url:https://hotels4.p.rapidapi.com/locations/search?rapidapi-key=01a8aff1d7msh1f0d2d85c237f29p1a75bcjsn06f796ce0b6e&query=amman

//****************go to properties/list :*******************//
//url https://hotels4.p.rapidapi.com/properties/list?rapidapi-key=01a8aff1d7msh1f0d2d85c237f29p1a75bcjsn06f796ce0b6e&destinationId=1771423&pageNumber=1&pageSize=25&adults1=1&currency=USD&locale=en_US&sortOrder=PRICE

//****************get from properties/list ==>>> id >>passing as hotelId for each of : ***************//
// 
//- properties/get-details:
//()
// url: https://hotels4.p.rapidapi.com/properties/get-details?rapidapi-key=01a8aff1d7msh1f0d2d85c237f29p1a75bcjsn06f796ce0b6e&id=687602&locale=en_US&currency=USD&adults1=1&checkOut=2020-01-15&checkIn=2020-01-08
//- reviews/list :
//() 
// url: https://hotels4.p.rapidapi.com/reviews/list?rapidapi-key=01a8aff1d7msh1f0d2d85c237f29p1a75bcjsn06f796ce0b6e&id=687602&page=1&loc=en_US 

//- properties/get-hotel-photos:
//()
// url: https://hotels4.p.rapidapi.com/properties/get-hotel-photos?rapidapi-key=01a8aff1d7msh1f0d2d85c237f29p1a75bcjsn06f796ce0b6e&id=687602

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//connection with postgress and express servers
// client.connect().then(() => {
server.listen(PORT, (req, res) => {
  console.log(`Listening on  PORT ${PORT} ...`);
});
// });
