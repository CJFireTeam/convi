import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: [ '4°Ciclo', 'Red', 'Blue','Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3,20],
      backgroundColor: [
        'rgba(255, 206, 86, 0.3)',//yellow
        'rgba(54, 162, 235, 0.3)', //blue
        'rgba(139, 69, 19, 0.3)', //brown
        'rgba(128, 128, 128, 0.3)', //brown

       
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)', //yellow
        'rgba(54, 162, 235, 1)', //blue
        'rgba(139, 69, 19, 1)', //brown
        'rgba(128, 128, 128, 1)', //brown
     
      ],
      borderWidth: 1,
    },
  ],
};

const options = {
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

const Grafico2 = () => {
  return <Pie data={data} options={options} />;
};

export default Grafico2;

