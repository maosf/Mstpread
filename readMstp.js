const Bacnet = require('node-bacnet');

// Create an instance of the BACnet client
const client = new Bacnet({ adpuTimeout: 6000 }); // Adjust timeout if needed

// BACnet/IP Gateway Address (IP/MSTP Gateway IP)
const gatewayAddress = '192.168.10.68'; // Replace with your gateway IP
const mstpNetworkNumber = 2001; // Network number of the MSTP device
// MSTP device addressing 
// const deviceInstance = 205; // Device ID of the MSTP device
// const mstpMacAddress = 5; // MSTP MAC address of the target device (1-127)
// const objectId = { type: Bacnet.enum.ObjectType.ANALOG_INPUT, instance: 2 };// Define the object you want to read (e.g., Analog Input, instance 0)
// MSTP device addressing for office
const deviceInstance = 203; // Device ID of the MSTP device
const mstpMacAddress = 3; // MSTP MAC address of the target device (1-127)
const objectId = { type: Bacnet.enum.ObjectType.ANALOG_INPUT, instance: 3 };





// Define the property to read (Present Value)
const propertyId = Bacnet.enum.PropertyIdentifier.PRESENT_VALUE;

// Create the BACnet address for the MSTP device through the IP/MSTP gateway
const mstpDeviceAddress = {
    address: gatewayAddress, // Gateway IP address
    net: mstpNetworkNumber,  // MSTP network number
    adr: [mstpMacAddress]    // MSTP MAC address as an array
};

// Read the property from the MSTP device through the gateway
client.readProperty(mstpDeviceAddress, objectId, propertyId, (err, value) => {
    if (err) {
        console.error('Error reading property from MSTP device:', err);
        client.close();
    } else {
        console.log('Property value from MSTP device:', value);
        client.close();
    }

    // Close the BACnet client
    // client.close();
});

