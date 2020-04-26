const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const EventHubReader = require('./event-hub-reader.js');
const iotHubConnectionString = "HostName=Nodehube.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=+ctwhNAt7hVf6lGKRE6Uv7miAjZy7cV4hF5bx6mHK7s=";
const eventHubConsumerGroup = "node";
const cors = require('cors');



const PORT = process.env.PORT || 5000;
 
const router =require('./router')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.sockets.on('connection', (socket) => {
    console.log(`new connection id: ${socket.id}`);
    sendData(socket);
    socket.on('disconnect',()=>{
        console.log('Disconneted');
    })
})


app.use(router);
app.use(cors());
server.listen(PORT, ()=>console.log('server is running on port' ,PORT));
function sendData(socket){
  const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

  (async () => {
    await eventHubReader.startReadMessage((message, date, deviceId) => {
      try {
          var time = date.toISOString().slice(11,18);
       const payload = {
        IotData: message,
        MessageDate: date || Date.now().toISOString(),
        DeviceId: deviceId,
      };
        console.log(payload);
  
        socket.emit('data1',payload);
      } catch (err) {
        console.error('Error broadcasting: [%s] from [%s].', err, message);
      }
    });
  })().catch();
}


// const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

// (async () => {
//   await eventHubReader.startReadMessage((message, date, deviceId) => {
//     try {
//         var time = date.toISOString().slice(11,18);
//       const payload = {
        
//         Pressure : message.Pressure.toFixed(2),
//         Ph : message.Ph.toFixed(2),
//         Flowrate : message.Flowrate.toFixed(2),
//         MessageDate: time || Date.now().toISOString(),
//         DeviceId: deviceId,
//       };
//       console.log(payload);

//       socket.emit('data1',payload);
//     } catch (err) {
//       console.error('Error broadcasting: [%s] from [%s].', err, message);
//     }
//   });
// })().catch();