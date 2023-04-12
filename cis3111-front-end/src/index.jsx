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
      setReset(!reset);
    } catch (e) {
      console.log("Error: " + e);
    }
  };
  //Creating a function whoch will generate and store all the random numbers.
  const generateNumbers = async () => {
    try {
      const promises = [];
      //Storing the URL in a constant.
      const url = //"http://localhost:5000/storeNumbers";
        "https://api-dot-cis3111-2023-assignment-1.ew.r.appspot.com/storeNumbers";
      //Starting message.
      console.log(">>!Started!<<");
      for (let i = 0; i < 1000; i++) {
        const batch = [];
        for (let j = 0; j < 10; j++) {
          batch.push(fetch(url));
        }
        promises.push(Promise.all(batch));
        //Brief timeout to introduce a buffer to the SQL connections
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      await Promise.all(promises);
      //Finished message.
      console.log(">>!Finished!<<");
    } catch (e) {
      console.log("Error: " + e);
    }
  };
  //Creating a function whoch will get the minimum and maximum.
  const getNumbers = () => {
    const url =
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
          the instances, such as the largest and smallest numbers.
        </p>
        {reset && (
          <button className="generateButton" onClick={resetTable}>
            Reset
          </button>
        )}
        <button className="generateButton" onClick={generateNumbers}>
          Generate
        </button>
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
            disabled={showTable}
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
