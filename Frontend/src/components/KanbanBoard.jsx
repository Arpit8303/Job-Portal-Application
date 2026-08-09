import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import JobCard from './JobCard';
import { useAppContext } from '../context/AppContext';

const KanbanBoard = ({ jobs, onEdit, onDelete }) => {
  const { updateJob } = useAppContext();
  
  // Local state for optimistic updates
  const [localJobs, setLocalJobs] = useState(jobs);

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  // Group jobs by status
  const columns = {
    pending: [],
    interview: [],
    offer: [],
    reject: []
  };

  localJobs.forEach(job => {
    if (columns[job.status]) {
      columns[job.status].push(job);
    }
  });

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a column or didn't move
    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    const newStatus = destination.droppableId;

    // Optimistic update
    setLocalJobs(prev => prev.map(job => 
      job._id === draggableId ? { ...job, status: newStatus } : job
    ));

    // Backend update via context
    // This updates the backend and then dispatches UPDATE_JOB_IN_LIST
    await updateJob(draggableId, { status: newStatus });
  };

  // Titles for columns
  const columnTitles = {
    pending: 'Pending',
    interview: 'Interview',
    offer: 'Offer',
    reject: 'Rejected'
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {Object.entries(columns).map(([status, list]) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`kanban-column ${snapshot.isDraggingOver ? 'kanban-column--drag-over' : ''}`}
                style={{ minWidth: '280px', flex: 1 }}
              >
                <h3 className={`kanban-column__title status-${status}`}>{columnTitles[status]}</h3>
                <div className="kanban-column__jobs" style={{ minHeight: '150px' }}>
                  {list.map((job, index) => (
                    <Draggable draggableId={job._id} index={index} key={job._id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            margin: '0 0 16px 0',
                          }}
                        >
                          <JobCard job={job} onEdit={onEdit} onDelete={onDelete} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
