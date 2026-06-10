import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';
import KanbanBoard from '../components/KanbanBoard';
import { MdAdd, MdSearch, MdViewList, MdViewKanban, MdFileDownload } from 'react-icons/md';

const Jobs = () => {
  const {
    jobs, filters, fetchJobs, createJob, updateJob, deleteJob, setFilters, setPage, setViewMode
  } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ search: value });
    }, 500);
  };

  const handleExportCSV = () => {
    if (!jobs.list.length) return;
    const headers = ['Position', 'Company', 'Status', 'Work Type', 'Location', 'Created At'];
    const csvRows = [headers.join(',')];
    
    jobs.list.forEach(job => {
      const values = [
        `"${job.position}"`,
        `"${job.company}"`,
        `"${job.status}"`,
        `"${job.workType}"`,
        `"${job.workLocation}"`,
        `"${new Date(job.createdAt).toLocaleDateString()}"`
      ];
      csvRows.push(values.join(','));
    });
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'job_applications.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleCreateJob = async (formData) => {
    setIsSubmitting(true);
    const result = await createJob(formData);
    setIsSubmitting(false);
    if (result?.success) {
      setShowModal(false);
      fetchJobs(1);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleUpdateJob = async (formData) => {
    setIsSubmitting(true);
    const result = await updateJob(editingJob._id, formData);
    setIsSubmitting(false);
    if (result?.success) {
      setShowModal(false);
      setEditingJob(null);
    }
  };

  const handleDeleteClick = (job) => {
    setShowDeleteConfirm(job);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deleteJob(showDeleteConfirm._id);
    setIsDeleting(false);
    setShowDeleteConfirm(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchJobs(newPage);
  };

  const renderPagination = () => {
    if (jobs.numOfPage <= 1) return null;
    const pages = [];
    for (let i = 1; i <= jobs.numOfPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination__btn ${i === jobs.currentPage ? 'pagination__btn--active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="pagination">
        <button
          className="pagination__btn"
          disabled={jobs.currentPage === 1}
          onClick={() => handlePageChange(jobs.currentPage - 1)}
        >
          Prev
        </button>
        {pages}
        <button
          className="pagination__btn"
          disabled={jobs.currentPage === jobs.numOfPage}
          onClick={() => handlePageChange(jobs.currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="jobs-page">
      <div className="page-header">
        <div>
          <h1>My Jobs</h1>
          <p>{jobs.totalJobs} application{jobs.totalJobs !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn--secondary" onClick={handleExportCSV} title="Export CSV">
            <MdFileDownload /> Export
          </button>
          <button className="btn btn--primary" onClick={() => { setEditingJob(null); setShowModal(true); }}>
            <MdAdd /> Add Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filters-bar__search">
          <MdSearch className="filters-bar__search-icon" />
          <input
            type="text"
            placeholder="Search by position..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filters-bar__selects">
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reject">Rejected</option>
            <option value="interview">Interview</option>
          </select>
          <select value={filters.workType} onChange={(e) => handleFilterChange('workType', e.target.value)}>
            <option value="all">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
          <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="a-z">A — Z</option>
            <option value="z-a">Z — A</option>
          </select>
          <div className="view-toggle" style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button 
              style={{ padding: '8px 12px', background: filters.viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent', color: filters.viewMode === 'list' ? 'var(--accent)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
              onClick={() => setViewMode('list')}
            ><MdViewList size={20} /></button>
            <button 
              style={{ padding: '8px 12px', background: filters.viewMode === 'kanban' ? 'var(--bg-tertiary)' : 'transparent', color: filters.viewMode === 'kanban' ? 'var(--accent)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--border-color)' }}
              onClick={() => setViewMode('kanban')}
            ><MdViewKanban size={20} /></button>
          </div>
        </div>
      </div>

      {/* Job List */}
      {jobs.isLoading ? (
        <div className="page-loading">
          <div className="spinner spinner--lg" />
          <p>Loading jobs...</p>
        </div>
      ) : jobs.totalJobs === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <h3>No Jobs Found</h3>
          <p>Try adjusting your filters or add a new job application.</p>
          <button className="btn btn--primary" onClick={() => { setEditingJob(null); setShowModal(true); }}>
            <MdAdd /> Add Your First Job
          </button>
        </div>
      ) : (
        <>
          {filters.viewMode === 'kanban' ? (
            <KanbanBoard jobs={jobs.list} onEdit={handleEditJob} onDelete={handleDeleteClick} />
          ) : (
            <div className="jobs-grid">
              {jobs.list.map((job) => (
                <JobCard key={job._id} job={job} onEdit={handleEditJob} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
          {renderPagination()}
        </>
      )}

      {/* Create/Edit Modal */}
      <JobModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingJob(null); }}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
        job={editingJob}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal__body">
              <p>Are you sure you want to delete the <strong>{showDeleteConfirm.position}</strong> position at <strong>{showDeleteConfirm.company}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal__actions">
              <button className="btn btn--secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? <span className="spinner" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
