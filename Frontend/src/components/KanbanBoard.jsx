import JobCard from './JobCard';

const KanbanBoard = ({ jobs, onEdit, onDelete }) => {
  const columns = [
    { id: 'pending', title: 'Pending' },
    { id: 'interview', title: 'Interview' },
    { id: 'offer', title: 'Offer' },
    { id: 'reject', title: 'Rejected' },
  ];

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <div key={column.id} className="kanban-column">
          <h3 className="kanban-column__title">{column.title}</h3>
          <div className="kanban-column__jobs">
            {jobs.filter(job => job.status === column.id).map(job => (
              <JobCard key={job._id} job={job} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
