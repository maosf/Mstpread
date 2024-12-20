const bacnet = require('node-bacnet');
const client= new bacnet({
    port: 47808,
    // interface: '192.168.10.68',
    // broadcastAddress:'192.168.10.255',
    apduTimeout:9000
});
const data=[];
const routerAddress = {
    address: '192.168.10.68',   // IP address of the  contemperoy BACnet/IP-MSTP router
    // ip: '192.168.10.24',   // IP address of the elast BACnet/IP-MSTP router
    net: 2001,             // Mstp Network number 
    adr: [1]               // MSTP address of the target device 1-127(1 in this case)
  };
  let deviceMac=3;
// const mstpDecAddr ={
//     address: routerAddress.address,
//     net: routerAddress.net,
//     adr:[deviceMac]
// };


function readValue(ip,type1,instance1,propId){
  const mstpDecAddr={...ip,adr:[instance1]};
  client.readProperty(mstpDecAddr,{type: type1, instance: instance1},propId,(err, value)=>{
    if (err){console.log('error for bacnet network respone')}
    else{
        const v=parseFloat(value.values[0].value.toFixed(1));
        if (!NaN){
          if (data.findIndex(room=>room.decvice===deviceMac)===-1)
               {data.push({decvice:deviceMac, value:v})}
          else{
            data.map(room=>{ room.decvice===deviceMac ? room.value=v : room});
          }
          console.log("data:",data);
        } else{
           console.log(`error reading prop is not a number`)
       }
    }
});
}
const read=(ip,type1,instance1,propId)=> {
  const mstpDecAddr={...ip,adr:[instance1]};
  client.readProperty(mstpDecAddr,{type: type1, instance: instance1},propId,(err, value)=>{
    if (err){console.log('error for bacnet network respone')}
    else{
        const v=parseFloat(value.values[0].value.toFixed(1));
        if (!NaN){
          if (data.findIndex(room=>room.decvice===deviceMac)===-1)
               {data.push({decvice:deviceMac, value:v})}
          else{
            data.map(room=>{ room.decvice===deviceMac ? room.value=v : room});
          }
          console.log("data:",data);
        } else{
           console.log(`error reading prop is not a number`)
       }
    }
});
};


const readPropPromise =  (ip,type, instance, propertyId)=>{
      const decAddr={...ip,adr:[instance]};
      return new Promise((resolve, reject)=>{
        client.readProperty(decAddr,{type:type, instance:instance},propertyId, (err,value)=>{
          if (err){
            console.log(err);
            reject('err when read from bacnet network :',err);
          }else{
            resolve(value.values[0].value.toFixed(1));
          }
        })
      });
    };

read(routerAddress,0,3,85);
// readPropPromise(routerAddress,0,3,85)
// .then((value)=>{
//   data.push(value);
//   console.log("data:", data)})  
// .catch((err)=>console.log("promise value err:", err));

// readPropPromise(mstpDecAddr,0,deviceMac,85);

 const i={...routerAddress,adr:[3]} 
 setInterval(()=>read(i,0,3,85),6000);
module.exports={data};
