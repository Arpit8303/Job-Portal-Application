import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MdPerson, MdEmail, MdLocationOn, MdBadge } from 'react-icons/md';

const Profile = () => {
  const { auth, updateProfile } = useAppContext();
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || '',
    location: auth.user?.location || '',
    skills: auth.user?.skills ? auth.user.skills.join(', ') : '',
    resumeUrl: auth.user?.resumeUrl || '',
    monthlyGoal: auth.user?.monthlyGoal || 20,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    
    // Process skills string to array
    const submitData = { ...formData };
    submitData.skills = submitData.skills.split(',').map(s => s.trim()).filter(Boolean);
    submitData.monthlyGoal = Number(submitData.monthlyGoal);
    
    await updateProfile(submitData);
    setIsLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account details</p>
      </div>

      <div className="profile-card">
        <div className="profile-card__avatar">
          <div className="profile-avatar">
            {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h3>{auth.user?.name} {auth.user?.lastName}</h3>
          <p>{auth.user?.email}</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">First Name *</label>
              <div className="input-wrapper">
                <MdPerson className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="First name"
                  className={errors.name ? 'input--error' : ''}
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <div className="input-wrapper">
                <MdBadge className="input-icon" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={errors.lastName ? 'input--error' : ''}
                />
              </div>
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className={errors.email ? 'input--error' : ''}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <div className="input-wrapper">
              <MdLocationOn className="input-icon" />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your location"
                className={errors.location ? 'input--error' : ''}
              />
            </div>
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="skills">Skills (comma separated)</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Design"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="resumeUrl">Resume URL</label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="resumeUrl"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://link-to-resume.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="monthlyGoal">Monthly Goal</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="monthlyGoal"
                  name="monthlyGoal"
                  value={formData.monthlyGoal}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : null}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
