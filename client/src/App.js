  import React,{useState, useEffect} from 'react';
 
  import {
    Line,LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
  } from 'recharts';
  import io from 'socket.io-client';
  const socket = io('http://localhost:5000');

  function App() {
  
    const [dataReact, setData] = useState([]);



    useEffect(() => {
      socket.on('data1', res => {
        console.log(res);
      setData(currentData => [...currentData, res]);
     
      
      });
  }, []);

  if(dataReact.length > 10)
  {
    dataReact.shift();
  }

    return (
      <div className="App">
        <ResponsiveContainer width="99%" aspect={3} >
        <LineChart
        width={500}
        height={300}
        data={dataReact}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="MessageDate" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
        </ResponsiveContainer>
        
        
      </div>
    );
  }

  export default App;
