import { MdLocationOn, MdCalendarToday, MdEdit, MdDelete, MdBusinessCenter, MdWork } from 'react-icons/md';

const statusColors = {
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  interview: { bg: '#d1fae5', color: '#059669', label: 'Interview' },
  reject: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

const workTypeLabels = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'internship': 'Internship',
  'contract': 'Contract',
};

const JobCard = ({ job, onEdit, onDelete }) => {
  const statusStyle = statusColors[job.status] || statusColors.pending;
  const formattedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="job-card">
      <div className="job-card__header">
        <div className="job-card__company-icon">
          {job.company?.charAt(0)?.toUpperCase() || 'C'}
        </div>
        <div className="job-card__title-group">
          <h3 className="job-card__position">{job.position}</h3>
          <p className="job-card__company">{job.company}</p>
        </div>
        <span
          className="job-card__status"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {statusStyle.label}
        </span>
      </div>
      <div className="job-card__details">
        <div className="job-card__detail">
          <MdLocationOn className="job-card__detail-icon" />
          <span>{job.workLocation}</span>
        </div>
        <div className="job-card__detail">
          <MdBusinessCenter className="job-card__detail-icon" />
          <span>{workTypeLabels[job.workType] || job.workType}</span>
        </div>
        <div className="job-card__detail">
          <MdCalendarToday className="job-card__detail-icon" />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="job-card__actions">
        <button className="btn btn--edit" onClick={() => onEdit(job)}>
          <MdEdit /> Edit
        </button>
        <button className="btn btn--delete" onClick={() => onDelete(job)}>
          <MdDelete /> Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
