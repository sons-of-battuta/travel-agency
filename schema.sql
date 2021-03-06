drop table if exists user;

create table user(
id serial primary key,
fname varchar(255),
lname varchar(255),
phone varchar(10),
password varchar(255)
);
