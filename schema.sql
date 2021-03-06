-- use this comman to create the table from within the terminal 
--  psql -f schema.sql -d travel

drop table if exists user1;

-- user table 
create table user1(
id serial primary key,
fname varchar(255),
lname varchar(255),
phone varchar(10),
password varchar(255)
);


