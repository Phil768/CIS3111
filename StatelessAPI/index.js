const express = require("express");
const app = express();

app.get("/generate", (req, res) => {
  const numInstances = 10;
  const numbersPerInstance = 1000;
  const totalNumbers = numInstances * numbersPerInstance;
  const result = [];

  for (let i = 0; i < numbersPerInstance; i++) {
    result.push(Math.floor(Math.random() * 1000));
  }

  res.json(result);
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server listening on port 8080.");
});
