CREATE TABLE users(user_id SERIAL PRIMARY KEY,
            first_name VARCHAR (50) NULL,
            last_name VARCHAR (50) NULL,
            email VARCHAR (355) UNIQUE NULL,
            created_on TIMESTAMP  NULL,
            last_login TIMESTAMP,
            user_image VARCHAR (100)  NULL,
            device_type VARCHAR (50)  NULL,
            device_id VARCHAR (100)  NULL,
            device_name VARCHAR (100)  NULL,
            last_visited_screen VARCHAR (100)  NULL,
            phone_no VARCHAR (15) UNIQUE NOT NULL)

CREATE TABLE otp(id SERIAL PRIMARY KEY, 
            user_id INTEGER,
            otp INTEGER,
            created_on TIMESTAMP without time zone NOT NULL)

CREATE TABLE userstoken(id SERIAL PRIMARY KEY, 
            user_id INTEGER,
            token VARCHAR (125),
            created_on TIMESTAMP without time zone NOT NULL)