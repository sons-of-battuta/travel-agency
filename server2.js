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
const PORT = 3008;

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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//try hotels API

{/* 
<form action="/search" method="GET">
    <input type="text" placeholder="Search City" id="search_input" name="cityName">
    <button id="search-button">Search</button>
</form>
</section> */}
//search by city name get destinationId *from index=>cityhotels
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

  //button<a> /hotels
  // form action="/viewDetails"

//search by city name get destinationId *from index=>cityhotels
  server.post('/hotels/:hotel_destinationId ',(req,res) =>{
    let hotel_destinationId=req.params;
    console.log(hotel_destinationId);
    let key=process.env.Hotel_key;
    let url=`https://hotels4.p.rapidapi.com/properties/list?rapidapi-key=${key}&pageNumber=1&pageSize=25&adults1=1&currency=USD&locale=en_US&sortOrder=PRICE&destinationId=${hotel_destinationId}`;
    console.log(url)
    
    superagent.get (url)
    .then (hotelsResult =>{
 
    let hotelsArr=hotelsResult.body.data.body.searchResults.results.map(element => new HotelProertiesList (element));
    // console.log(hotelsArr);
    res.render('pages/hotelview',{hotelsPropertiesList:hotelsArr});
    })
    .catch(error=>{
      console.log("Error in getting hotels data",error.message);
    })
    })

    function HotelProertiesList(hotelData) {
      this.id=hotelData[0].id;
      this.name =hotelData[0].name;
      this.starRating=hotelData[0].starRating;
    }





function hotel(hotelData) {
  this.name =hotelData.name;
  this.geoId =hotelData.geoId;
  this.destinationId =hotelData.destinationId;
  this.caption =hotelData.caption;
  this.latitude =hotelData.latitude;
  this.longitude =hotelData.longitude;  
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
