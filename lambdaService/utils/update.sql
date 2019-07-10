CREATE TABLE users(user_id SERIAL PRIMARY KEY,
            first_name VARCHAR (50) NOT NULL,
            last_name VARCHAR (50) NOT NULL,
            email VARCHAR (355) UNIQUE NOT NULL,
            created_on TIMESTAMP NOT NULL,
            last_login TIMESTAMP

CREATE TABLE otp(id SERIAL PRIMARY KEY, 
            user_id INTEGER,
            otp INTEGER,
            created_on TIMESTAMP without time zone NOT NULL

CREATE TABLE userstoken(id SERIAL PRIMARY KEY, 
            user_id INTEGER,
            token VARCHAR (125),
            created_on TIMESTAMP without time zone NOT NULL