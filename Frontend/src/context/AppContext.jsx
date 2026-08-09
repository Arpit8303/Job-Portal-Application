import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { TOKEN_KEY } from '../services/api';
import authService from '../services/authService';
import jobService from '../services/jobService';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  isCommandPaletteOpen: false,
  auth: {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: JSON.parse(localStorage.getItem('jobPortalUser')) || null,
  },
  jobs: {
    list: [],
    totalJobs: 0,
    numOfPage: 1,
    currentPage: 1,
    isLoading: false,
    error: null,
  },
  filters: {
    search: '',
    status: 'all',
    workType: 'all',
    sort: 'latest',
    viewMode: 'list',
  },
  stats: {
    totalJobs: 0,
    defaultStats: { pending: 0, reject: 0, interview: 0 },
    monthlyApplication: [],
  },
};

const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTH: 'SET_AUTH',
  LOGOUT: 'LOGOUT',
  SET_JOBS: 'SET_JOBS',
  SET_FILTERS: 'SET_FILTERS',
  SET_STATS: 'SET_STATS',
  SET_PAGE: 'SET_PAGE',
  SET_ERROR: 'SET_ERROR',
  UPDATE_JOB_IN_LIST: 'UPDATE_JOB_IN_LIST',
  REMOVE_JOB_FROM_LIST: 'REMOVE_JOB_FROM_LIST',
  SET_USER: 'SET_USER',
  SET_THEME: 'SET_THEME',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_COMMAND_PALETTE: 'SET_COMMAND_PALETTE',
};

function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, jobs: { ...state.jobs, isLoading: action.payload } };
    case ActionTypes.SET_AUTH:
      return { ...state, auth: { token: action.payload.token, user: action.payload.user } };
    case ActionTypes.LOGOUT:
      return { ...state, auth: { token: null, user: null } };
    case ActionTypes.SET_JOBS:
      return {
        ...state,
        jobs: {
          ...state.jobs,
          list: action.payload.jobs,
          totalJobs: action.payload.totalJobs,
          numOfPage: action.payload.numOfPage,
          isLoading: false,
          error: null,
        },
      };
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ActionTypes.SET_STATS:
      return { ...state, stats: action.payload };
    case ActionTypes.SET_PAGE:
      return { ...state, jobs: { ...state.jobs, currentPage: action.payload } };
    case ActionTypes.SET_ERROR:
      return { ...state, jobs: { ...state.jobs, error: action.payload, isLoading: false } };
    case ActionTypes.UPDATE_JOB_IN_LIST:
      return {
        ...state,
        jobs: {
          ...state.jobs,
          list: state.jobs.list.map((j) => (j._id === action.payload._id ? action.payload : j)),
        },
      };
    case ActionTypes.REMOVE_JOB_FROM_LIST:
      return {
        ...state,
        jobs: {
          ...state.jobs,
          list: state.jobs.list.filter((j) => j._id !== action.payload),
          totalJobs: state.jobs.totalJobs - 1,
        },
      };
    case ActionTypes.SET_USER:
      return { ...state, auth: { ...state.auth, user: action.payload } };
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    case ActionTypes.SET_VIEW_MODE:
      return { ...state, filters: { ...state.filters, viewMode: action.payload } };
    case ActionTypes.SET_COMMAND_PALETTE:
      return { ...state, isCommandPaletteOpen: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: ActionTypes.SET_THEME, payload: state.theme === 'light' ? 'dark' : 'light' });
  }, [state.theme]);

  const setViewMode = useCallback((mode) => {
    dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: mode });
  }, []);

  const setCommandPaletteOpen = useCallback((isOpen) => {
    dispatch({ type: ActionTypes.SET_COMMAND_PALETTE, payload: isOpen });
  }, []);

  const registerUser = useCallback(async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem('jobPortalUser', JSON.stringify(data.user));
        dispatch({ type: ActionTypes.SET_AUTH, payload: { token: data.token, user: data.user } });
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const loginUser = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem('jobPortalUser', JSON.stringify(data.user));
        dispatch({ type: ActionTypes.SET_AUTH, payload: { token: data.token, user: data.user } });
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('jobPortalUser');
    dispatch({ type: ActionTypes.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (userData) => {
    try {
      const res = await authService.updateProfile(userData);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem('jobPortalUser', JSON.stringify(res.data.user));
      dispatch({ type: ActionTypes.SET_AUTH, payload: { token: res.data.token, user: res.data.user } });
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const fetchJobs = useCallback(async (page) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const currentPage = page || state.jobs.currentPage;
      const data = await jobService.getJobs({
        page: currentPage,
        status: state.filters.status,
        workType: state.filters.workType,
        search: state.filters.search,
        sort: state.filters.sort,
      });
      dispatch({
        type: ActionTypes.SET_JOBS,
        payload: { jobs: data.jobs, totalJobs: data.totalJobs, numOfPage: data.numOfPage },
      });
      if (page) dispatch({ type: ActionTypes.SET_PAGE, payload: page });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch jobs';
      dispatch({ type: ActionTypes.SET_ERROR, payload: msg });
    }
  }, [state.filters, state.jobs.currentPage]);

  const createJob = useCallback(async (jobData) => {
    try {
      const data = await jobService.createJob(jobData);
      if (data.success) {
        toast.success('Job created successfully!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create job';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const updateJob = useCallback(async (id, jobData) => {
    try {
      const data = await jobService.updateJob(id, jobData);
      if (data.success) {
        dispatch({ type: ActionTypes.UPDATE_JOB_IN_LIST, payload: data.job });
        toast.success('Job updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = status === 403 ? 'Not authorized to edit this job'
        : status === 404 ? 'Job not found'
        : error.response?.data?.message || 'Failed to update job';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const deleteJob = useCallback(async (id) => {
    try {
      const data = await jobService.deleteJob(id);
      if (data.success) {
        dispatch({ type: ActionTypes.REMOVE_JOB_FROM_LIST, payload: id });
        toast.success('Job deleted successfully!');
        return { success: true };
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = status === 403 ? 'Not authorized to delete this job'
        : status === 404 ? 'Job not found'
        : error.response?.data?.message || 'Failed to delete job';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await jobService.getStats();
      if (data.success) {
        dispatch({
          type: ActionTypes.SET_STATS,
          payload: {
            totalJobs: data.totalJobs,
            defaultStats: data.defaultStats,
            monthlyApplication: data.monthlyApplication,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: newFilters });
    dispatch({ type: ActionTypes.SET_PAGE, payload: 1 });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: ActionTypes.SET_PAGE, payload: page });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        registerUser,
        loginUser,
        logoutUser,
        updateProfile,
        fetchJobs,
        createJob,
        updateJob,
        deleteJob,
        fetchStats,
        setFilters,
        setPage,
        toggleTheme,
        setViewMode,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
