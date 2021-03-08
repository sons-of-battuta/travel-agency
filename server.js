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
const PORT = process.env.PORT || 3001;
// const PORT = 5555;

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
server.get('/about', (req, res) => {
    res.render("./pages/about");
});
// to render contact 
server.get('/contact', getContact);
server.post('/contact', postContact);

server.get('/login', logIn);
server.get('/signup', signUp);
server.post('/addUserToDatabase', addUser);
server.post('/checkUser', checkUser);
server.get('/search', getImages);
server.post('/sentences', getTranslation);
// server.get('/hotelDetails/:hotel_id', getHotelDetails);
//Hotels API
// server.get('/hotels', getHotels);

let cityName='Dubai';



function getImages(req, res) {
  cityName = req.query.cityName;
  // let cityName = 'paris';
  let key = process.env.CLIENT_ID;
  let URL = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${key}`;
  superagent.get(URL)
    .then(results => {
      let arr = results.body.results.map(value => value.urls.raw);
      // res.send(arr);
      getHotels();

      setTimeout(() => { res.render('./pages/details', { arrOfImages: arr.slice(0, 6) , cityName: cityName, hotels:arrayOfHotels})}, 4000);
      
      // console.log('Data inside getImages', hotels);
      // console.log(hotels);
      // res.render('./pages/details', { arrOfImages: arr.slice(0, 6) , cityName: cityName, hotels:arrayOfHotels});
      
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

function signUp(req, res) {
    res.render('./pages/signup-page');
}

function addUser(req, res) {
    let phoneNumber = req.body.phoneNumber;
    // console.log(phoneNumber);
    //this query to get the full name of the user if it is already has an account.
    let SQL = `select fname, lname from user1 where phone = '${phoneNumber}';`;

    let sql = `insert into user1 (fname, lname, phone, password) values($1,$2,$3,$4);`;
    let values = [req.body.firstName, req.body.lastName, req.body.phoneNumber, md5(req.body.password)];

    //checke whether phone number is already signed up(has an account)
    client.query(SQL)
        .then(data => {
            console.log(data.rows);
            if (data.rows.length === 0) {
                client.query(sql, values)
                    .then(results => {
                        console.log('row inserted Successfully...');
                        res.render('./pages/index');
                    }).catch(error => console.log("Error in inserting user: ", error.message))
            } else {
                res.render('./pages/error-signup', { message: "there is an account already ", fullname: `${data.rows[0].fname} ${data.rows[0].lname}` });
            }

        }).catch(error => console.log('Error in checking whether number is already has an account: ', error.message));
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
    // console.log(data.rows);
    if(data.rows.length === 0){
      client.query(sql,values)
      .then(results=>{
        console.log('user registered Successfully...');
        res.render('./pages/index');
      }).catch(error=> console.log("Error in inserting user: ", error.message))
    }
    else{
      res.render('./pages/error-signup',{message: "there is an account already ",fullname:`${data.rows[0].fname} ${data.rows[0].lname}`});
    }

  }).catch(error=> console.log('Error in checking whether number is already has an account: ', error.message));
}
function logIn(req, res) {
    res.render('./pages/login-page', { message: '', needToSignUp: 'false' });
}

function checkUser(req, res) {
    let phoneNumber = req.body.phoneNumber;
    console.log(phoneNumber);
    let sql = `select password from user1 where phone = '${phoneNumber}';`;
    let password = req.body.password;
    client.query(sql)
        .then(results => {
            console.log(results.rows);
            if (results.rows.length > 0) {
                let passwordDB = results.rows[0].password;
                if (md5(password) === passwordDB) {
                    res.render('./pages/index');
                    // res.render('./pages/login-page',{message:"Wrong password",needToSignUp:'false'}
                } else
                    res.render('./pages/login-page', { message: "Wrong password", needToSignUp: 'false' });
            } else
                res.render('./pages/login-page', { message: "you need to sign up first", needToSignUp: 'true' });
        })
        .catch(error => {
            console.log('Error in getting user info from database: ', error.message);
        })
}

//getContact Function
function getContact(req, res) {
    let SQL = 'SELECT * FROM plans;';
    client.query(SQL)
        .then(result => {
            res.render("./pages/contact", { plansArr: result.rows })

        })
}




let arrayOfHotels=[];
//get hotels details from API
function getHotels(req, res){
  //array of objects for hotels
  //send sql to check if the city is already exists in the database. So we don't need to call the API
  let sql = `select city_name from hotels where city_name = $1;`;
  let values = [cityName];
  let city='';
  client.query(sql, values)
  .then(resultDB=>{
    // console.log(resultDB.rows);

    //get the cityname from the data base
    if(resultDB.rows.length !==0){
      city = resultDB.rows[0].city_name;
    }
    // console.log('city = ', city);
    // console.log('cityName = ', cityName);

    
    //this code MUST be after the then 
    if(city.toLowerCase() === cityName.toLowerCase()){
      console.log('city found in database');
      let sql = `select * from hotels where city_name = $1`;
      let values = [city];
      client.query(sql, values)
      .then(result =>{
        // console.log(result.rows[0]);
        //array of records/rows
        let rows = result.rows;
        // console.log(rows);
        arrayOfHotels = rows;
        // console.log(arrayOfHotels);
        // return arrayOfHotels;
        // rows.forEach(value=>{
          

          // let hotelName = value.hotel_name;
          // let content = value.content;
          // let address = value.address;
          // let starRating = value.star_rating;
          // let neighborhood = value.neighborhood;
          // let transportationName = value.airport;
          // let transportationTime = value.time_to_arrive;
          // let price = value.price;
          // let hotelImagesString = value.hotel_images.split(',');
          // let roomsImagesString = value.room_images.split('#');
          // let hotelId = value.hotel_id;

        // });//end of forEach
      }).catch(error => console.log('Error in getting all the columns of the cityName',error.message));
    }
    else{
      console.log('getting data from hotel API');
      let key = process.env.HOTEL_KEY;
    let url=`https://hotels4.p.rapidapi.com/locations/search?rapidapi-key=${key}&query=${cityName}`;
   //send the first request using the city name inorder to get the destination ids for all the hotels in that city
    superagent.get(url)
    .then(result=>{
      // get the destination ids and save them in an array to use them in the second request
      let desId = result.body.suggestions[0].entities.map(value => value.destinationId);
      
      let url2 = `https://hotels4.p.rapidapi.com/properties/list?rapidapi-key=${key}&destinationId=${desId[0]}`;
      //send the second request using the destination id to get the id for each hotel so that we can get the details of that hotel.
      superagent.get(url2)
      .then(result2=>{
        //get the ids of the hotels and save them in an array in order to use them in the third request
        let arrOfId = result2.body.data.body.searchResults.results.map(value => value.id);

        for(let i=0; i<5; i++){
          let url3 = `https://hotels4.p.rapidapi.com/properties/get-details?rapidapi-key=${key}&id=${arrOfId[i]}`;
          superagent.get(url3)
          .then(result3 =>{
            let hotelName = result3.body.data.body.propertyDescription.name; //hotel name
            let content = result3.body.data.body.overview.overviewSections[0].content.join(','); //what the hotels offers such as wifi and parking
            let address = result3.body.data.body.propertyDescription.address.fullAddress; // get the fill address of the hotel
            let starRating = result3.body.data.body.propertyDescription.starRating; //the rating number of stars
            
            let neighborhood = result3.body.neighborhood.neighborhoodName; // the area that the hotel is near to or within
            
            let transportationName = result3.body.transportation.transportLocations[0].locations[0].name; // the nearest airport name
            
            // the times needed to get the hotel from the airport
            let transportationTime = result3.body.transportation.transportLocations[0].locations[0].distanceInTime;
            // console.log(`neaest airport is: ${transportationName} and it is far from ${hotelName}: ${transportationTime}`);
            let price = result3.body.data.body.propertyDescription.featuredPrice.currentPrice.formatted;
            // console.log('price: ',price );
            
            let url4 = `https://hotels4.p.rapidapi.com/properties/get-hotel-photos?rapidapi-key=${key}&id=${arrOfId[i]}`;
            // console.log(url4);
            
            //send the fourth request to get the images of the hotel
            superagent.get(url4)
            .then(result4=>{
              let arrOfHotelImages = result4.body.hotelImages.map(value => value.baseUrl.replace('{size}','z')); //hotel images
              // console.log(arrOfHotelImages.join(','));
              arrOfHotelImages = arrOfHotelImages.join(',');
              
              
              let arrOfRoomImages = result4.body.roomImages[0].images.map(value => value.baseUrl.replace('{size}','y')); //room images
              arrOfRoomImages = arrOfRoomImages.join('#');

              let sql4 = `insert into hotels(city_name, hotel_name, content, address, star_rating, neighborhood, airport, time_to_arrive ,price, hotel_images, room_images,hotel_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12)`;
              let values = [cityName, hotelName, content, address, starRating, neighborhood, transportationName, transportationTime, price, arrOfHotelImages, arrOfRoomImages, arrOfId[i]];

              client.query(sql4, values)
              .then(result =>{
                console.log("city inserted Successfully");
              }).catch(error=> console.log("Error in inserting hotel from api into db: ", error.message));
              
            }).catch(error=> console.log('Error in getting hotel images: ', error.message));
    
            // setTimeout(() => {  console.log("Wait..."); }, 1000);
            
          }).catch(error => console.log('Error in getting properties of hotels: ', error.message));

        }
  
        //send the third request with the id of each hotel so that we get all the detials about each hotel
       
  
  
      }).catch(error => console.log('Error in getting data using des id: ', error.message))
  
    })
    .catch(error => console.log("Error in getting hotels data: ",error.message));
    }
    

  }).catch(error => console.log("Error in getting city name from database: ", error.message));

//  res.render('Hello it is working');
  return arrayOfHotels;
}//end of getHotels()

function postContact(req, res) {
    let { name, phone, description } = req.body;
    let SQL = "INSERT INTO plans (name, phone, description) VALUES ($1,$2,$3);";
    let values = [name, phone, description]
    client.query(SQL, values)
        .then(() => res.redirect('/contact')

        ).catch(error => {
            console.log('Error in setting plans into database ', error.message);
        })
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
