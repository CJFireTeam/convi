import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['1° ciclo', '2° ciclo', '3° ciclo', '4° ciclo'],
  datasets: [
    {
      label: '# of Votes',
      data: [10, 35, 15, 35],
      backgroundColor: [
        'rgba(54, 162, 235, 0.4)',
        'rgba(139, 69, 19, 0.4)',
        'rgba(128, 128, 128, 0.4)',
        'rgba(255, 206, 86, 0.4)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(139, 69, 19, 1)',
        'rgba(128, 128, 128, 1)',
        'rgba(255, 206, 86, 1)',
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

const GraficoFases = ({dataNumbers}: {dataNumbers:number[]}) => {
  const [data, setData] = useState({
    labels: ['1° ciclo', '2° ciclo', '3° ciclo', '4° ciclo'],
    datasets: [
      {
        label: 'Cantidad en ciclos',
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.4)',
          'rgba(139, 69, 19, 0.4)',
          'rgba(128, 128, 128, 0.4)',
          'rgba(255, 206, 86, 0.4)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(139, 69, 19, 1)',
          'rgba(128, 128, 128, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });


  useEffect(() => {
    setData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: dataNumbers,
        },
      ],
    }));
  }, [dataNumbers]);

  return <Doughnut data={data} options={options} />;
};

export default GraficoFases;
