'use client'

import dynamic from 'next/dynamic'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
)

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
})

const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), {
  ssr: false,
})

const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
})

export function ActivityLineChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <div className="h-[240px] w-full">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Request volume',
              data: values,
              fill: true,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.10)',
              pointBackgroundColor: '#2563eb',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 5,
              tension: 0.35,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              backgroundColor: '#0f172a',
              padding: 10,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 11 } },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(148, 163, 184, 0.18)' },
              ticks: { color: '#64748b', font: { size: 11 } },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}

export function StatusDoughnutChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <div className="h-[220px] w-full">
      <Doughnut
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
              borderColor: '#ffffff',
              borderWidth: 6,
              hoverOffset: 6,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 16,
                color: '#475569',
                font: { size: 11 },
              },
            },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 10,
            },
          },
        }}
      />
    </div>
  )
}

export function VolumeBarChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  return (
    <div className="h-[240px] w-full">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Volume',
              data: values,
              backgroundColor: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'],
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              backgroundColor: '#0f172a',
              padding: 10,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 11 } },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(148, 163, 184, 0.18)' },
              ticks: { color: '#64748b', font: { size: 11 } },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}
