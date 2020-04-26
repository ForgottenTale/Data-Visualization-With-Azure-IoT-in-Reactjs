  import React,{useState, useEffect} from 'react';
 
  import {Line} from 'react-chartjs-2';
  import io from 'socket.io-client'
  const socket = io('http://localhost:5000');

  function App() {
    const [chartData, setChartData] = useState({});
    const [dataReact, setData] = useState({});
    var temp =[];
    var time = [];

    const chart = ()=>{
      setChartData({
        labels: time,
          datasets: [{
              label: 'Temperature',
              data: temp,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                
              ],
              borderWidth: 1,
              fill: false,
        
        yAxisID: 'Temperature',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
          }]
      })
    }

    useEffect(()=>{
        socket.on('data1', res => {
        console.log(res);
        temp.push(res.IotData.temperature);
        time.push(res.MessageDate.slice(11,18));
        if(temp.length == 10 || time.length == 10)
        {
          temp.shift();
          time.shift();
        }
        chart();
        });
        
      
    },[])
    const chartOptions = {
      scales: {
        yAxes: [{
          id: 'Temperature',
          type: 'linear',
          scaleLabel: {
            labelString: 'Temperature (ºC)',
            display: true,
          },
          position: 'left',
        }
        ]
      }
    };

    return (
      <div className="App">
        <Line data={chartData} options = {chartOptions}/>
      </div>
    );
  }

  export default App;
