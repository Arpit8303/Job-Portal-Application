import { MdWork, MdHourglassEmpty, MdThumbDown, MdEventAvailable } from 'react-icons/md';

const StatsCards = ({ totalJobs, defaultStats }) => {
  const cards = [
    {
      title: 'Total Applications',
      count: totalJobs,
      icon: <MdWork />,
      color: '#7c3aed',
      bg: '#ede9fe',
    },
    {
      title: 'Pending',
      count: defaultStats?.pending || 0,
      icon: <MdHourglassEmpty />,
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      title: 'Interview',
      count: defaultStats?.interview || 0,
      icon: <MdEventAvailable />,
      color: '#059669',
      bg: '#d1fae5',
    },
    {
      title: 'Rejected',
      count: defaultStats?.reject || 0,
      icon: <MdThumbDown />,
      color: '#dc2626',
      bg: '#fee2e2',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.title}>
          <div className="stat-card__icon" style={{ backgroundColor: card.bg, color: card.color }}>
            {card.icon}
          </div>
          <div className="stat-card__info">
            <p className="stat-card__count">{card.count}</p>
            <p className="stat-card__title">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
