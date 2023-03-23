//Importing the required libraries;
const express = require("express");
const mysql = require("promise-mysql");
const app = express();
//Storing the port into a constant variable.
const port = 3000;
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
//Creating the first endpoint of the API, which is responsible for generating and storing the random numbers.
app.post("/storeNumbers", async (req, res) => {
  try {
    const TCP = await createTcpPool();
    const connection = await TCP.getConnection();
    for (let i = 0; i < 1000; i++) {
      try {
        //For each iteration we generate a number between 0 and 100,000.
        const randomNumber = Math.floor(Math.random() * 100001);
        //Getting the instance name.
        const instanceName = process.env.GAE_INSTANCE;
        //Creating the query which is used to store both the numbers and the instance name into the databse.
        const query = `INSET INTO random_numbers (number, instance) VALUES (${randomNumber}, ${instanceName})`;
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
      message: "Execution worked successfully",
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
//Creating a method which is listening to any icnomeing requests.
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
