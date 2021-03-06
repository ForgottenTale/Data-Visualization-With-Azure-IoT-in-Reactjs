// Importing all the neccessary modules

const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const router = require('./router')
const { EventHubProducerClient, EventHubConsumerClient } = require('@azure/event-hubs');
const { convertIotHubToEventHubsConnectionString } = require('./iot-hub-connection-string.js')
var consumerClient;

// Enter your iothub connection string in .evc file

const iotHubConnectionString = "HostName=NodeMCUHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=GQjC3mv6S9uYMPCHE4B+yfQWkspE1c+eYDOFqhGzFlA=";
const eventHubConsumerGroup = "node";

// Creating the server

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(router);
app.use(cors());
server.listen(PORT, () => console.log('server is running on port', PORT));

// Function to start the connection to iothub

async function startConnection() {
  try {
    const eventHubConnectionString = await convertIotHubToEventHubsConnectionString(iotHubConnectionString);
    consumerClient = new EventHubConsumerClient(eventHubConsumerGroup, eventHubConnectionString);
    console.log('Successfully created the EventHubConsumerClient from IoT Hub event hub-compatible connection string.');
    const partitionIds = await consumerClient.getPartitionIds();
    console.log('The partition ids are: ', partitionIds);
  } catch (ex) {
    console.error(ex.message || ex);
  }

}
startConnection();

//Function to read messages from iothub

async function startReadMessage(startReadMessageCallback) {
  try {
    consumerClient.subscribe({
      processEvents: (events, context) => {
        for (let i = 0; i < events.length; ++i) {
          startReadMessageCallback(
            events[i].body,
            events[i].enqueuedTimeUtc,
            events[i].systemProperties["iothub-connection-device-id"]);
        }
      },
      processError: (err, context) => {
        console.error(err.message || err);
      }
    });
  } catch (ex) {
    console.error(ex.message || ex);
  }
}


// Socket.io part

io.sockets.on('connection', (socket) => {


  console.log(`new connection id: ${socket.id}`);


  (async () => {
    await startReadMessage((message, date, deviceId) => {
      try {

        const options = {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
        var time = new Date().toLocaleTimeString("en-IN", options).slice(0, 8);
        var date = date.toISOString().slice(0, 10);
        var dateTime = [date, time].filter(Boolean).join(" ");

  
        let payload = {
          Pressure: message.Pressure.toFixed(2),
          Ph: message.Ph.toFixed(2),
          Flowrate: message.Flowrate.toFixed(2),
          date: dateTime,
          DeviceId: message.deviceId,
        };
        console.log(payload);
        socket.broadcast.emit('data1', payload);

      } catch (err) {
        console.error('Error broadcasting: [%s] from [%s].', err, message);
      }
    });
  })().catch();
  socket.on('disconnect', () => {

    console.log('Disconneted');
  })
})

