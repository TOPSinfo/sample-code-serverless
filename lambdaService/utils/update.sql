CREATE TABLE Users(user_id SERIAL PRIMARY KEY,
            first_name VARCHAR (50) NOT NULL,
            last_name VARCHAR (50) NOT NULL,
            email VARCHAR (355) UNIQUE NOT NULL,
            created_on TIMESTAMP NOT NULL,
            last_login TIMESTAMP