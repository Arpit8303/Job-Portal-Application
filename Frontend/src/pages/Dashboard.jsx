import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import StatsCards from '../components/StatsCards';
import Charts from '../components/Charts';
import GoalTracker from '../components/GoalTracker';

const Dashboard = () => {
  const { stats, fetchStats } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      await fetchStats();
      setIsLoading(false);
    };
    loadStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner--lg" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your job application statistics</p>
      </div>
      
      <GoalTracker />

      <StatsCards totalJobs={stats.totalJobs} defaultStats={stats.defaultStats} />

      {stats.totalJobs === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <h3>No Data Yet</h3>
          <p>Start adding jobs to see your application statistics here.</p>
        </div>
      ) : (
        <Charts
          defaultStats={stats.defaultStats}
          monthlyApplication={stats.monthlyApplication}
        />
      )}
    </div>
  );
};

export default Dashboard;
