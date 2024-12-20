const express = require("express");
const fs = require("fs");
const bacnet = require("node-bacnet");
const ejs = require("ejs");
const http = require("http");
const exp = require("constants");
const cors = require("cors");
const e = require("express");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//const BACnet = require('node-bacnet');
// Initialize the BACnet client
const client = new bacnet({
  apduTimeout: 6000 // Adjust based on network latency
});

// Define your parameters
let targetDevice =3;  //Mstp device mac address 1-127
const routerAddress = {
  ip: '192.168.10.68',   // IP address of the BACnet/IP-MSTP router
  // ip: '192.168.10.24',   // IP address of the BACnet/IP-MSTP router
  net: 2001,             // Network number 
  adr: [targetDevice]               // MSTP address of the target device (3 in this case)
};

const objectId = { type: 0, instance: 3 }; // Example object type and instance
const propertyId = 85; // Property ID (e.g., 85 for 'presentValue')
// Address to target (through the router)
let targetAddress = {
  address: routerAddress.ip,
  net: routerAddress.net,
  adr: routerAddress.adr
};

const devicePort = 47808;
const device = [3,4,5,6,7,8];
const sensorData = {};
const rooms={3:'Operator room',4:'shop kitchen',5:'workshop',6:'east workshop',7:'Fitness Gym',8:'bookstore'};
const deviceAddress={
  address: '192.168.10.68',    //contemperoy router ip address
  // address: '192.168.10.24', //elast router ip address
  net: 2001,                   //mstp network number
  adr: [3]                     // mstp device instance
};
// const baseDevice={
//   device:deviceAddress, //mstp device object include properties: ip, network, and device instance
//   type:0,               //bacnet type,  analog input: 0, analog valve:3
//   instance: 3,          //bacnet instance 
//   property: 85           // bacnet property present value:85             
// };
// const readPropPromise =  (data)=>{
//   return new Promise((resolve, reject)=>{
//     client.readProperty(data.ip,{type:data.type, instance:data.instance},data.propertyId, (err,value)=>{
//       if (err){
//         console.log(err);
//         reject(err);
//       }else{
//         resolve(value)
//       }
//     })
//   });
// };
// const readProps=(data)=>{
//   client.readProperty(data.device,{type:data.type, instance:data.instance},data.propertyId, (err,value)=>{
//     if (err){
//       console.log(err);
      
//     }else{
//       return value.values[0].value;
//     }
//   })
// };
// console.log("basedevice",readProps(baseDevice));
// const getAllData = ()=>{
//   const deviceDbs=
//   device.map((eachDevice)=>{
//     let deviceAddr={...deviceAddress, adr:[eachDevice]};// instance:(eachDevice!==7)?3:1};
//     client.readProperty(deviceAddr,{type:0, instance:(eachDevice!=7)?3:1},(err, value)=>{
//       if (err){console.log('readproperty err from ', eachDevice)}
//       if(value){
//       const v =  Number(value.values[0].value).toFixed(1);
//       sensorData[eachDevice]=v;
//       return v;
//     }
//   });
// })};
      

// getAllData();

app.get("/", (req, res) => {
  
  let count = 0;
  device.forEach((deviceMac) => {
   const  targetDeviceAddress ={
    ...deviceAddress,
    adr: [deviceMac]
   };
  
    console.log(targetDeviceAddress);
    client.readProperty(
      targetDeviceAddress,
      { type: bacnet.enum.ObjectType.ANALOG_INPUT, instance: (deviceMac!==7)?3:1 }, 85,
      (err, value) => {
        if (err) {
          console.error(`Error reading sensor ${deviceMac}:`, err);
          // sensorData[deviceMac] = "error";
          
        } else {
           const v =value.values[0].value;
           if( value.values[0].value!= null )
          {sensorData[deviceMac] = value.values[0].value.toFixed(1);}
        }
        count++;
        if (count === device.length) {
            console.log(sensorData);
            sendResponse(res);
        }
      }
    );
  });
  //  const dbs= getAllData();
  //  if (dbs.length===device.length){sendResponse(res)};
  
});

function sendResponse(res) {
  // Read the HTML file
  fs.readFile("app.html", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      // Replace placeholders in HTML with sensor data

      let htmlWithData = data.replace(
        "{SENSOR_DATA}",
        JSON.stringify(sensorData)
      );
      htmlWithData = htmlWithData.replace("{rooms}",JSON.stringify(rooms));

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlWithData);
    }
  });
}  


const port = 3001;
app.listen(port, () => console.log(`server is running on port ${port}`));