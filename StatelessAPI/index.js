//Importing the required libraries;
const express = require("express");
const mysql = require("promise-mysql");
const cors = require("cors");
const app = express();
//Storing the port into a constant variable.
const port = process.env.PORT || 5000;
//Establishing the connection with the database.
const createTcpPool = async (config) => {
  //Creating an object with all the required properties.
  const dbConfig = {
    host: "34.78.16.243",
    port: "3306",
    user: "CIS3111_Assignment",
    password: "CIS3111",
    database: "CIS3111_Assignment",
  };
  //Returning the connection.
  return mysql.createPool(dbConfig);
};
console.log(port);
// Set up CORS headers to allow requests from different servers.
app.use(
  cors({
    origin: "https://cis3111-2023-assignment-1.ew.r.appspot.com",
  })
);
res.setHeader(
  "Access-Control-Allow-Origin",
  "https://cis3111-2023-assignment-1.ew.r.appspot.com"
);
// app.use((req, res, next) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://cis3111-2023-assignment-1.ew.r.appspot.com/"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   next();
// });
//Handling the root URL.
app.get("/", function (req, res) {
  res.send("Welcome to my API!");
});
//Creating the first endpoint of the API, which is responsible for generating and storing the random numbers.
app.post("/storeNumbers", async (req, res) => {
  try {
    //Establishing the connection.
    const TCP = await createTcpPool();
    const connection = await TCP.getConnection();
    //Creating the table;
    const dropTableQuery = `DROP TABLE IF EXISTS random_numbers;`;
    await connection.query(dropTableQuery);
    const createTableQuery = `CREATE TABLE random_numbers (instance_name VARCHAR(255), random_number INTEGER);`;
    await connection.query(createTableQuery);
    for (let i = 0; i < 5; i++) {
      try {
        //For each iteration we generate a number between 0 and 100,000.
        const randomNumber = Math.floor(Math.random() * 100001);
        //Getting the instance name.(default in case it is used locally)
        const instanceName = process.env.GAE_INSTANCE || "default";
        //Creating the query which is used to store both the numbers and the instance name into the databse.
        const query = `INSERT INTO random_numbers (instance_name, random_number) VALUES (${instanceName}, ${randomNumber});`;
        //Executing the query.
        await connection.query(query);
        console.log("Connected and generated number");
      } catch (e) {
        console.log("Failed because: " + e);
      }
    }
    //Closing the connection.
    await connection.release();
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
    //Getting the largest number and its isntance.
    const largest =
      "SELECT MAX(random_number) AS largest_number, instance_name FROM random_numbers GROUP BY instance_name;";
    //Saving the returned object into a variable.
    const largestResult = await connection.query(largest);
    //Saving the largest number and its instance name into separate variables.
    const largestNumber = largestResult[0].largest_number;
    const largestInstanceName = largestResult[0].instance_name;
    //Getting the smallest number and its isntance.
    const smallest =
      "SELECT MIN(random_number) AS smallest_number, instance_name FROM random_numbers GROUP BY instance_name;";
    //Saving the returned object into a variable.
    const smallestResult = await connection.query(smallest);
    //Saving the smallest number and its instance name into separate variables.
    const smallestNumber = smallestResult[0].smallest_number;
    const smallestInstanceName = smallestResult[0].instance_name;
    //Closing the connection.
    await connection.release();

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
      largest: { number: largestNumber, instance: largestInstanceName },
      smallest: { number: smallestNumber, instance: smallestInstanceName },
    };
    //Returning the obtained data.
    res.send(returnedData);
  } catch (e) {
    //Getting a failed message from serer if something goes wrong.
    console.error(e);
    res.status(500).json({
      message: "Error generating and storing random numbers",
      error: e.message,
    });
  }
});
//Creating a method which is listening to any icnomeing requests.
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
