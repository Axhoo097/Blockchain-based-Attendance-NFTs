'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AnalyticsData } from '@/types';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_DEFAULTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  // Top Skills Bar Chart
  const skillsData = {
    labels: data.topSkills.map((s) => s.skill),
    datasets: [{
      label: 'Usage Count',
      data:  data.topSkills.map((s) => s.count),
      backgroundColor: 'rgba(168,85,247,0.5)',
      borderColor:     '#a855f7',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  // Activity Line Chart
  const activityData = {
    labels: data.recentActivity.map((a) => a._id),
    datasets: [{
      label: 'New Users',
      data:  data.recentActivity.map((a) => a.count),
      borderColor:          '#06b6d4',
      backgroundColor:      'rgba(6,182,212,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#06b6d4',
    }],
  };

  // Overview Doughnut
  const overviewData = {
    labels: ['Users', 'Posts'],
    datasets: [{
      data: [data.totalUsers, data.totalPosts],
      backgroundColor: ['rgba(168,85,247,0.7)', 'rgba(6,182,212,0.7)'],
      borderColor:     ['#a855f7', '#06b6d4'],
      borderWidth: 2,
    }],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Skills */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">🔧 Top Skills</h3>
        {data.topSkills.length > 0 ? (
          <Bar data={skillsData} options={{ ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, title: { display: false } } }} />
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
            No skill data yet
          </div>
        )}
      </div>

      {/* Platform Overview */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">📊 Platform Overview</h3>
        <div className="max-w-[200px] mx-auto">
          <Doughnut
            data={overviewData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } },
              },
            }}
          />
        </div>
      </div>

      {/* Activity (7 days) */}
      <div className="bg-card/50 border border-border rounded-xl p-4 lg:col-span-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">📈 User Activity (7 days)</h3>
        {data.recentActivity.length > 0 ? (
          <Line data={activityData} options={CHART_DEFAULTS} />
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
            No activity data yet
          </div>
        )}
      </div>
    </div>
  );
}
