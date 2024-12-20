const express = require("express");
const fs = require("fs");
const bacnet = require("node-bacnet");
const ejs = require("ejs");
const http = require("http");
const exp = require("constants");
const cors = require("cors");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//const BACnet = require('node-bacnet');
// Initialize the BACnet client
const client = new bacnet({
  apduTimeout: 3000 // Adjust based on network latency
});

// Define your parameters
let targetDevice = 3;
const routerAddress = {
  ip: '192.168.10.68',   // IP address of the BACnet/IP-MSTP router
  net: 2001,             // Network number 
  adr: [targetDevice]               // MSTP address of the target device (5 in this case)
};

const objectId = { type: 0, instance: 3 }; // Example object type and instance
const propertyId = 85; // Property ID (e.g., 85 for 'presentValue')
// Address to target (through the router)
let targetAddress = {
  address: routerAddress.ip,
  net: routerAddress.net,
  adr: routerAddress.adr
};
// Function to read property from the MSTP device
// const readPropertyFromMSTP = (targetAddress, objectId, propertyId) => {
//   client.readProperty(targetAddress, objectId, propertyId, (err, value) => {
//     if (err) {
//       console.error('Error reading property:', err);
//       return;
//     }
//     console.log('Property value:', value);
//   });
// };

// Perform the read property request
//readPropertyFromMSTP(targetAddress, objectId, propertyId); //read my office temp

// Close the client after some time (to keep the script running for asynchronous operations)
//setTimeout(() => client.close(), 10000); // Adjust as needed for your operations


// const client = new bacnet();
// const deviceIP = "192.168.10.30";
const devicePort = 47808;
const device = [3, 4, 5, 6];

app.get("/", (req, res) => {
  const sensorData = {};
  let count = 0;
  device.forEach((deviceMac) => {
   let  targetDeviceAddress ={
    address: '192.168.10.68',
    net: 2001,
    adr: [deviceMac]
   }
    console.log(targetDeviceAddress);
    client.readProperty(
      targetDeviceAddress,
      { type: bacnet.enum.ObjectType.ANALOG_INPUT, instance: 3 },
      85,
      (err, value) => {
        if (err) {
          console.error(`Error reading sensor ${deviceMac}:`, err);
          // sensorData[deviceMac] = "error";
        } else {
          sensorData[deviceMac] = value.values[0].value.toFixed(1);
        }
        count++;
        if (count === device.length) {
            console.log(sensorData);
          if(sensorData){sendResponse()};
        }
      }
    );
  });
  function sendResponse() {
    // Read the HTML file
    fs.readFile("app.html", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading HTML file:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        // Replace placeholders in HTML with sensor data

        const htmlWithData = data.replace(
          "{SENSOR_DATA}",
          JSON.stringify(sensorData)
        );
        // htmlWithData = htmlWithData.replace("{rooms}", rooms);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(htmlWithData);
      }
    });
  }
});
const port = 3001;
app.listen(port, () => console.log(`server is running on port ${port}`));