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
    const url = //"http://localhost:5000/resetTable";
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
    alert("Started generating numbers.");
    setShowProgress(true);
    try {
      //Storing the URL in a constant.
      const url = //"http://localhost:5000/storeNumbers";
        "https://api-dot-cis3111-2023-assignment-1.ew.r.appspot.com/generateNumbers";
      for (let i = 0; i < 10; i++) {
        //Creating the start and end parameters for the loop according to the current state.
        const start = i * 1000; //1000 is the size of each batch
        const finish = Math.min(start + 1000, 10000); //10,000 is the total number of requests.
        //Creating a new array witch each iteration to hold teh current batch.
        const batch = [];
        for (let j = start; j < finish; j++) {
          //Generating the numbers.
          try {
            batch.push(fetch(url));
            console.log("success");
          } catch (e) {
            console.log("Number generation failed: " + e);
          }
        }
        try {
          //Awaiting all the promises to finish.
          await Promise.all(batch);
          //Brief timeout to increase resources strain.
          await sleep(1000);
          //Updating the display of the current batch.
          setCurrentBatch(`Inserted batch [${i + 1}]`);
          //Setting the progress of the progress bar.
          setProgress((i + 1) / 1000);
        } catch (error) {
          console.log(`Error in batch [${i + 1}]: ${error}`);
        }
      }
      //Setting a timeout to make sure that all the numbers have been generated before romeving all UI from screen.
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
        alert("Finsihed generating numbers.");
      }, 2000);
    } catch (e) {
      console.log("Error: " + e);
    }
  };
  //Sleep function used by the above.
  const sleep = async (msec) => {
    return new Promise((resolve) => setTimeout(resolve, msec));
  };
  //Creating a function whoch will get the minimum and maximum.
  const getNumbers = () => {
    const url = //"http://localhost:5000/getNumbers";
      "https://api-dot-cis3111-2023-assignment-1.ew.r.appspot.com/getNumbers";
    fetch(
      //"http://localhost:5000/getNumbers"
      url
    )
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
      console.log("HIT");
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
