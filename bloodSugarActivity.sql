DROP DATABASE IF EXISTS bloodSugarActivity;
CREATE DATABASE bloodSugarActivity;

\c bloodsugaractivity

CREATE TABLE bloodSugarEntries (
    ID SERIAL PRIMARY KEY,
    type VARCHAR, 
    name VARCHAR,
    type_id INTEGER,
    time_stamp TIMESTAMP,
    gi_index INTEGER
);
