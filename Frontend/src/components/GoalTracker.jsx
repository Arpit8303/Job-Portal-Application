import { useAppContext } from '../context/AppContext';

const GoalTracker = () => {
  const { auth, stats } = useAppContext();
  
  if (!auth.user) return null;

  const goal = auth.user.monthlyGoal || 20;
  
  // Calculate applications this month
  const currentMonthDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const thisMonthData = stats.monthlyApplication.find(m => m.date === currentMonthDate);
  const applied = thisMonthData ? thisMonthData.count : 0;
  
  const percentage = Math.min((applied / goal) * 100, 100);

  return (
    <div className="goal-tracker stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '12px' }}>
        <h3 className="stat-card__title" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Monthly Goal</h3>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{applied} / {goal} Applications</span>
      </div>
      <div className="progress-bar-bg" style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.5s ease-out' }}
        />
      </div>
      {applied >= goal && (
        <p style={{ color: 'var(--success)', fontSize: '13px', marginTop: '8px' }}>🎉 Goal reached!</p>
      )}
    </div>
  );
};

export default GoalTracker;
