/* eslint-disable no-unused-vars */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

//Main function to be displayed.
function Container() {
  const [data, setData] = React.useState({});
  const [showTable, setShowTable] = React.useState(false);
  const [reset, setReset] = React.useState(true);
  const [currentBatch, setCurrentBatch] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [showProgress, setShowProgress] = React.useState(false);
  //Creating a function which resets the table.
  const resetTable = () => {
    const url =
      "https://api-dot-cis3111-2023-assignment-1.ew.r.appspot.com/resetTable";
    try {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error.message);
        });
      alert("Table containing all random numbers has been reset.");
      setReset(!reset);
    } catch (e) {
      console.log("Error: " + e);
    }
  };
  //Creating a function whoch will generate and store all the random numbers.
  const generateNumbers = async () => {
    const batchSize = 1000;
    const totalRequests = 10000;
    const batches = Math.ceil(totalRequests / batchSize);
    alert("Started generating numbers.");
    setShowProgress(true);
    //Storing the URL in a constant.
    const url =
      "https://api-dot-cis3111-2023-assignment-1.ew.r.appspot.com/storeNumbers";
    //Starting message.
    console.log(">>!Started!<<");
    setCurrentBatch(`Inserted batch [0/${batches}]`);
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const finish = Math.min(start + batchSize, totalRequests);
      //Creating a new array witch each iteration to hold teh current batch.
      const batch = [];
      for (let j = start; j < finish; j++) {
        batch.push(fetch(url));
      }
      setCurrentBatch(`Inserted batch [${i + 1}/${batches}]`);
      //Setting the progress of the progress bar.
      setProgress((i + 1) / batches);
      await Promise.all(batch);
      await sleep(1000);
    }
    console.log(">>!Finished!<<");
    setShowProgress(false);
  };
  //Sleep function used by the above.
  const sleep = async (msec) => {
    return new Promise((resolve) => setTimeout(resolve, msec));
  };
  //Creating a function whoch will get the minimum and maximum.
  const getNumbers = () => {
    const url =
      "https://api-dot-cis3111-2023-assignment-1.ew.r.appspot.com/getNumbers";
    fetch(url)
      .then(async (response) => {
        setData(await response.json());
      })
      .catch((error) => {
        console.log(error);
      });
    setShowTable(!showTable);
  };
  //Creatubg a useEffect for the state to update immediately upon change. This is required since setState is not asynchronous.
  React.useEffect(() => {
    console.log("DATA: " + JSON.stringify(data));
    if (data.hasOwnProperty("instances")) {
      data.instances?.map((item) =>
        console.log(item.instance_name, item.count)
      );
      //Creating the table which will display all the instances along with their number of generated numbers.
      const instancesTable = document.getElementById("instancesTable");
      const rows = data.instances
        ?.map(
          (item) =>
            `<tr><td>${item.instance_name}</td><td>${item.count}</td></tr>`
        )
        .join("");
      instancesTable.innerHTML = `
      <thead>
        <tr>
          <th>Instance name</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
      ${rows}
      </tbody>
      `;
      //Creating the table which will display the stats about all the instances.
      const dataContainer = document.getElementById("statsTable");
      dataContainer.innerHTML = `
      <thead>
        <tr>
          <th>Largest number</th>
          <th>Largest number instance</th>
          <th>Smallest number</th>
          <th>Smallest number instance</th>
        </tr>
      </thead>
      <tbody>
          <tr>
            <td>${data.largest.number}</td>
            <td>${data.largest.instance}</td>
            <td>${data.smallest.number}</td>
            <td>${data.smallest.instance}</td>
          </tr>
      </tbody>`;
      //Creatng the table which will hold all the numbers and instances.
      const allNumbersTable = document.getElementById("allTable");
      const allRows = data.allNumbers
        ?.map(
          (item) =>
            `<tr><td>${item.instance_name}</td><td>${item.random_number}</td></tr>`
        )
        .join("");
      allNumbersTable.innerHTML = `
      <thead>
        <tr>
          <th>Instance name</th>
          <th>Number</th>
        </tr>
      </thead>
      <tbody>
      ${allRows}
      </tbody>
      `;
    } else {
      console.log("empty");
    }
  }, [data]);

  return (
    <div className="main-container">
      <div className="header">
        <h1>CIS3111 - Cloud Computing Assignment.</h1>
      </div>
      <div className="content-container">
        <p className="text">
          This is the main page for the first assignment issued by the CIS3111
          study unit. Below are two buttons, 'Generate' and 'Get'. The former is
          to call upon the API, send a post request, generate and store all the
          numbers in the databse. The latter on the other hand is to display the
          information about each instance. The first table describes all the
          instances created and the number of generated numbers that it has. The
          second table on the other hand displays some basic statistics found in
          the instances, such as the largest and smallest numbers. When
          attempting to generate a new set of numbers, it is best to refresh the
          page.
        </p>
        {reset && (
          <button className="generateButton" onClick={resetTable}>
            Reset
          </button>
        )}
        <button className="generateButton" onClick={generateNumbers}>
          Generate
        </button>
        {showProgress && (
          <div>
            <h4>{currentBatch}</h4>
            <div
              style={{
                width: "100%",
                height: "30px",
                backgroundColor: "#ccc",
                borderRadius: "5px",
                border: "1px solid black",
              }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  backgroundColor: "#4CAF50",
                  borderRadius: "5px",
                  transition: "width 0.3s ease-in-out",
                }}
              ></div>
            </div>
          </div>
        )}
        {showTable && (
          <div className="allInstances">
            <h2 className="sub-header">All instances and their size.</h2>
            <table id="instancesTable" className="table"></table>
          </div>
        )}
        {showTable && (
          <div className="instancesStats">
            <h2 className="sub-header">Instances statistics.</h2>
            <table id="statsTable" className="table"></table>
          </div>
        )}
        {showTable && (
          <div className="instancesStats">
            <h2 className="sub-header">All numbers.</h2>
            <table id="allTable" className="table"></table>
          </div>
        )}
        {!showTable && (
          <button
            className="getButton"
            onClick={getNumbers}
            disabled={showProgress}
          >
            Get
          </button>
        )}
      </div>
    </div>
  );
}

//Rendering the function.
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<Container />);
reportWebVitals();
