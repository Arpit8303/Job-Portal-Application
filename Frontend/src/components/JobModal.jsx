import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';

const workTypeOptions = ['full-time', 'part-time', 'internship', 'contract'];
const statusOptions = ['pending', 'reject', 'interview', 'offer'];

const statusLabels = { pending: 'Pending', reject: 'Rejected', interview: 'Interview', offer: 'Offer' };
const workTypeLabels = { 'full-time': 'Full Time', 'part-time': 'Part Time', 'internship': 'Internship', 'contract': 'Contract' };

const JobModal = ({ isOpen, onClose, onSubmit, job, isLoading }) => {
  const isEdit = !!job;
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    workType: 'full-time',
    workLocation: 'Mumbai',
    status: 'pending',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || '',
        position: job.position || '',
        workType: job.workType || 'full-time',
        workLocation: job.workLocation || 'Mumbai',
        status: job.status || 'pending',
      });
    } else {
      setFormData({
        company: '',
        position: '',
        workType: 'full-time',
        workLocation: 'Mumbai',
        status: 'pending',
      });
    }
    setErrors({});
  }, [job, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (formData.position.length > 100) newErrors.position = 'Position must be 100 characters or less';
    if (!formData.workLocation.trim()) newErrors.workLocation = 'Work location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{isEdit ? 'Edit Job' : 'Create New Job'}</h2>
          <button className="modal__close" onClick={onClose}><MdClose /></button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
              className={errors.company ? 'input--error' : ''}
            />
            {errors.company && <span className="form-error">{errors.company}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter position"
              maxLength={100}
              className={errors.position ? 'input--error' : ''}
            />
            <span className="char-count">{formData.position.length}/100</span>
            {errors.position && <span className="form-error">{errors.position}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="workType">Work Type</label>
              <select id="workType" name="workType" value={formData.workType} onChange={handleChange}>
                {workTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{workTypeLabels[opt]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{statusLabels[opt]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="workLocation">Work Location *</label>
            <input
              type="text"
              id="workLocation"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleChange}
              placeholder="Enter work location"
              className={errors.workLocation ? 'input--error' : ''}
            />
            {errors.workLocation && <span className="form-error">{errors.workLocation}</span>}
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : null}
              {isEdit ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
