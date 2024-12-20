const express = require("express");
const fs = require("fs");
const bacnet = require("node-bacnet");
const ejs = require("ejs");
const http = require("http");
const exp = require("constants");
const cors = require("cors");
const e = require("express");
const { type } = require("express/lib/response");
const mqtt = require('mqtt');
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());



// Initialize the BACnet client
const devicePort = 47808;  //bacnet port
const client = new bacnet({
  apduTimeout: 6000 // Adjust based on network latency
});

const routerAddress = {
  address: '192.168.10.68',   // IP address of the  contemperoy BACnet/IP-MSTP router
  // ip: '192.168.10.24',   // IP address of the elast BACnet/IP-MSTP router
  net: 2001,             // Network number 
  adr: [1]               // MSTP address of the target device 1-127(1 in this case)
};

const objectId = { type: 0, instance: 3 }; // Example object type and instance
const propertyId = 85; // Property ID (e.g., 85 for 'presentValue')
const mstpDeviceaddr=3; //mstp device mac address 1-127
// Address to target (through the router)
let targetAddress = {
  address: routerAddress.address,
  net: routerAddress.net,
  adr: mstpDeviceaddr
};

const deviceList = [3,4,5,6,7,8];  //Mstp devices mac address list
const sensorData = {};
const rooms={3:'Operator room',4:'shop kitchen',5:'workshop',6:'east workshop',7:'Fitness Gym',8:'bookstore'};
// const mdv={
//     MacAddress: mstpDeviceaddr,
//     type:objectId,
//     propertyId: propertyId
// }

// const readPropPromise =  (macAddr,type, instanc, propertyId)=>{
//   return new Promise((resolve, reject)=>{
//     client.readProperty({...targetAddress, adr:[macAddr]},{type:type, instance:instanc},propertyId, (err,value)=>{
//       if (err){
//         console.log(err);
//         reject(err);
//       }else{
//         resolve(value.values[0].value);
//       }
//     })
//   });
// };
// const getDb= async ()=>{
//     for( let i = 0; i<deviceList.length;i++){
//         //  const  targetDeviceAddress ={...targetAddress, adr: [deviceMac] };
//         // let m ={
//         //     MacAddress: deviceMac,
//         //     type: objectId,
//         //     propertyId:propertyId
//         // }
//         const resolve= await readPropPromise(deviceList[i],0,(deviceList[i]!==7)?3:1,85);
//         console.log(resolve);
//         if (!isNaN(resolve)){
//             sensorData[deviceList[i]] = resolve;
//         }


//     }};

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
const getAllData = ()=>{
   
    deviceList.forEach((deviceMac) => {
     const  targetDeviceAddress ={...targetAddress, adr: [deviceMac] };
     client.readProperty(
        targetDeviceAddress,
        { type: bacnet.enum.ObjectType.ANALOG_INPUT, instance: (deviceMac!==7)?3:1 }, 85,
        (err, value) => {
          if (err) {
            console.error(`Error reading sensor ${deviceMac}:`, err);
            
          } else {
             const v =value.values[0].value;
            //  console.log(v);
             if( v)
            {sensorData[deviceMac] = value.values[0].value.toFixed(1);}
          }
          
        }
      );
    });
};
      

setInterval(()=>getAllData(),10000);



app.get("/", (req, res) => {
    sendResponse(res);
   if (Object.keys(sensorData).length===deviceList.length){
      console.log(sensorData);}
//        sendResponse(res)};

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

//mqtt

// Connect to the MQTT broker (e.g., a public broker like test.mosquitto.org)
const brokerUrl = 'mqtt://test.mosquitto.org'; // Public broker for testing
const mqttclient = mqtt.connect(brokerUrl);

// Define a topic to subscribe and publish to
const topic = 'jack/gbc/temp';
// Event: On successful connection
mqttclient.on('connect', () => {
    console.log('Connected to MQTT broker.');
  
    // Subscribe to the topic
    mqttclient.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
  
        // Publish a message to the topic
        const message = JSON.stringify(sensorData);
        mqttclient.publish(topic, message, () => {
          console.log(`Published message: ${message}`);
        });
      } else {
        console.error('Subscription error:', err);
      }
    });
  });
 // Event: When a message is received
  mqttclient.on('message', (topic, message) => {
    console.log(`Received message from ${topic}: ${message.toString()}`);
  });
  
  
  // Event: On error
  mqttclient.on('error', (err) => {
    console.error('MQTT Client Error:', err);
  });

const port = 3001;
app.listen(port, () => console.log(`server is running on port ${port}`));