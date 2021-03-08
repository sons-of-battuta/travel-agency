-- use this comman to create the table from within the terminal 
--  psql -f schema.sql -d travel

-- add the following line to your .env file with the appropriate changes
-- DATABASE_URL=postgresql://yourname:yourpassword@localhost:5432/travel

drop table if exists user1;

-- user table 
create table user1(
id serial primary key,
fname varchar(255),
lname varchar(255),
phone varchar(10),
password varchar(255)
);


drop table if exists hotels;

-- create table hotels
create table hotels(
  id serial primary key,
  -- this id (hotel_id) for the hotel to get its details
  city_name varchar(255),
  hotel_name varchar(255),
  content text,
  address text,
  star_rating varchar(3),
  neighborhood varchar(255),
  airport varchar(255),
  time_to_arrive varchar(255),
  price  varchar(255),
  hotel_images text,
  room_images  text,
  hotel_id varchar(255)
);


