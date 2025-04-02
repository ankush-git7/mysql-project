const os = require('os');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const redis = require('redis');
const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
});

// MySQL Connection
const db = mysql.createConnection({
  host: 'mysql',  // This is the service name in docker-compose.yml
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase'
});

db.connect(err => {
  if (err) {
    console.error('MySQL Connection Error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/', function(req, res) {
    redisClient.get('numVisits', function(err, numVisits) {
        numVisitsToDisplay = parseInt(numVisits) + 1;
        if (isNaN(numVisitsToDisplay)) {
            numVisitsToDisplay = 1;
        }
      // Insert visit count into MySQL
        db.query('INSERT INTO visits (count) VALUES (?)', [numVisitsToDisplay], (err, result) => {
            if (err) console.error(err);
        });
       res.send(os.hostname() +': Number of visits is: ' + numVisitsToDisplay);
       redisClient.set('numVisits', numVisitsToDisplay);
    });
});

app.listen(5000, function() {
    console.log('Web application is listening on port 5000');
});
