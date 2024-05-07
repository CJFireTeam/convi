import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['1° ciclo', '2° ciclo', '3° ciclo', '4° ciclo',],
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

export default function grafico1() {
  return <Doughnut data={data} />;
}