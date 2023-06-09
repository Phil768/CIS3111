//Importing the required libraries;
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("promise-mysql");
const cors = require("cors");
const app = express();
//Storing the port into a constant variable.
const port = process.env.PORT || 5000;
//Establishing the connection with the database.
const createTcpPool = async (config) => {
  //Creating an object with all the required properties.
  const dbConfig = {
    connectionLimit: 10,
    host: "34.78.16.243",
    port: "3306",
    user: "CIS3111_Assignment",
    password: "CIS3111",
    database: "CIS3111_Assignment",
  };
  //Returning the connection.
  return mysql.createPool(dbConfig);
};
// Set up CORS headers to allow requests from different servers.
app.use(cors());
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});
//Handling the root URL.
app.get("/", function (req, res) {
  res.send("Welcome to my API for CIS3111!");
});
//hadnling the body parser.
app.use(bodyParser.json());
//Creating the first endpoint of the API, which is responsible for generating and storing the random numbers.
app.get("/storeNumbers", async (req, res) => {
  try {
    const randomNumber = Math.floor(Math.random() * 100001);
    //Getting the instance name.(default in case it is used locally)
    const instanceName = process.env.GAE_INSTANCE || "default";
    //Inserting the numners to the db.
    saveNumbers(instanceName, randomNumber);
    //Getting a successful message from serer if erverything works.
    res.status(200).json({
      message: "Success",
    });
  } catch (e) {
    //Getting a failed message from serer if something goes wrong.
    console.error(e);
    res.status(500).json({
      message: "Error generating and storing random numbers",
      error: e.message,
    });
  }
});
const saveNumbers = async (instance, number) => {
  try {
    const TCP = await createTcpPool();
    const connection = await TCP.getConnection();
    try {
      const insertQuery = `INSERT INTO random_numbers (instance_name, random_number) VALUES ('${instance}', ${number});`;
      await connection.query(insertQuery);
      console.log("Connected and generated number");
    } catch (e) {
      console.log("Failed because: " + e);
    }
    connection.destroy();
  } catch (e) {
    console.error(e);
  }
};
//Creating the second endpoint required to fetch the random numbers from the databse.
app.get("/getNumbers", async (req, res) => {
  try {
    //Establishing the connection.
    const TCP = await createTcpPool();
    const connection = await TCP.getConnection();
    //Selecting all the distinct instance names from the table.
    const allInstances =
      "SELECT instance_name, COUNT(*) as count FROM random_numbers GROUP BY instance_name;";
    //Executing the query.
    const allInstancesResult = await connection.query(allInstances);
    //Getting all the nmumbers and instances from the databse.
    const allNumbersQuery = `SELECT * FROM random_numbers;`;
    //Executing the query.
    const allNumbersResult = await connection.query(allNumbersQuery);
    //Getting the largest number and its isntance.
    const largest =
      "SELECT MAX(random_number) AS largest_number, instance_name FROM random_numbers GROUP BY instance_name;";
    //Saving the returned object into a variable.
    const largestResult = await connection.query(largest);
    //Getting the largest number and its instance from the returned data.
    const largestInformation = largestResult.reduce((prev, current) => {
      return prev.largest_number > current.largest_number ? prev : current;
    });
    //Storing the largest number and its instance into constants.
    const largestNumber = largestInformation.largest_number;
    const largestInstanceName = largestInformation.instance_name;
    //Getting the smallest number and its isntance.
    const smallest =
      "SELECT MIN(random_number) AS smallest_number, instance_name FROM random_numbers GROUP BY instance_name;";
    //Saving the returned object into a variable.
    const smallestResult = await connection.query(smallest);
    //Getting the smallest number and its instance from the returned data.
    const smallestInformation = smallestResult.reduce((prev, current) => {
      return prev.smallest_number < current.smallest_number ? prev : current;
    });
    //Saving the smallest number and its instance into constants.
    const smallestNumber = smallestInformation.smallest_number;
    const smallestInstanceName = smallestInformation.instance_name;
    //Closing the connection.
    connection.destroy();

    console.log(
      "The largest number is " +
        largestNumber +
        " and is in instance " +
        largestInstanceName
    );
    console.log(
      "The smallest number is " +
        smallestNumber +
        " and is in instance " +
        smallestInstanceName
    );
    //Storing the obtained data into a variable.
    const returnedData = {
      instances: allInstancesResult,
      allNumbers: allNumbersResult,
      largest: { number: largestNumber, instance: largestInstanceName },
      smallest: { number: smallestNumber, instance: smallestInstanceName },
    };
    //Returning the obtained data.
    res.send(returnedData);
  } catch (e) {
    //Getting a failed message from serer if something goes wrong.
    console.error(e);
    console.log(e);
    res.status(500).json({
      message: "Error getting random numbers",
      error: e.message,
    });
  }
});
//Creating the final endpoint which is used to reset the table content.
app.post("/resetTable", async (req, res) => {
  try {
    //Establishing the connection.
    const TCP = await createTcpPool();
    const connection = await TCP.getConnection();
    //Creating the table;
    const dropTableQuery = `DROP TABLE IF EXISTS random_numbers;`;
    await connection.query(dropTableQuery);
    const createTableQuery = `CREATE TABLE random_numbers (instance_name VARCHAR(255), random_number INTEGER);`;
    await connection.query(createTableQuery);
    //Closing the connection.
    connection.destroy();
    //Getting a successful message from serer if erverything works.
    res.status(200).json({
      message: "Success",
    });
  } catch (e) {
    //Getting a failed message from serer if something goes wrong.
    console.error(e);
    res.status(500).json({
      message: "Error creating the table",
      error: e.message,
    });
  }
});
//Creating a method which is listening to any icnomeing requests.
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
