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


drop table if exists plans;

-- contact table 
create table plans(
id serial primary key,
name varchar(255),
phone varchar(13),
description varchar(500)
);

