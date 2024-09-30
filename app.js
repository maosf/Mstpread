const BACnet = require('node-bacnet');
// Initialize the BACnet client
const client = new BACnet({
  apduTimeout: 6000 // Adjust based on network latency
});

// Define your parameters
const routerAddress = {
  ip: '192.168.10.68',   // IP address of the BACnet/IP-MSTP router
  net: 2001,             // Network number 
  adr: [3 ]              // MSTP address of the target device (5 in this case)
};

const objectId = { type: 0, instance: 3 }; // Example object type and instance
const propertyId = 85; // Property ID (e.g., 85 for 'presentValue')
// Address to target (through the router)
const targetAddress = {
  address: routerAddress.ip,
  net: routerAddress.net,
  adr: routerAddress.adr
};
// Function to read property from the MSTP device
const readPropertyFromMSTP = (targetAddress, objectId, propertyId) => {
  client.readProperty(targetAddress, objectId, propertyId, (err, value) => {
    if (err) {
      console.error('Error reading property:', err);
      client.close();;
    }
    console.log('Property value:', value);
    client.close();
  });
};

// Perform the read property request
readPropertyFromMSTP(targetAddress, objectId, propertyId); //read my office temp

// Close the client after some time (to keep the script running for asynchronous operations)
//setTimeout(() => client.close(), 10000); // Adjust as needed for your operations
