CREATE TABLE flights (
 id INT AUTO_INCREMENT PRIMARY KEY,
 flight_number VARCHAR(20),
 origin VARCHAR(100),
 destination VARCHAR(100),
 departure DATETIME,
 arrival DATETIME,
 price DECIMAL(10,2)
);

CREATE TABLE bookings (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id VARCHAR(255),
 flight_id INT,
 seat VARCHAR(20),
 booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (flight_id) REFERENCES flights(id)
);