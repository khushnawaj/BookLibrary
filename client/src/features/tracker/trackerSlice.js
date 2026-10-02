import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trackerService } from '@/services';

export const fetchTrackers = createAsyncThunk(
  'tracker/fetchTrackers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await trackerService.getTrackers(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch writing trackers');
    }
  }
);

export const fetchUnlinkedWorks = createAsyncThunk(
  'tracker/fetchUnlinkedWorks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trackerService.getUnlinkedWorks();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unlinked works');
    }
  }
);

export const fetchTrackerStats = createAsyncThunk(
  'tracker/fetchTrackerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trackerService.getStats();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tracker statistics');
    }
  }
);

export const createTracker = createAsyncThunk(
  'tracker/createTracker',
  async (data, { rejectWithValue }) => {
    try {
      const response = await trackerService.createTracker(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create writing tracker');
    }
  }
);

export const fetchTrackerById = createAsyncThunk(
  'tracker/fetchTrackerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await trackerService.getTrackerById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tracker details');
    }
  }
);

export const updateTracker = createAsyncThunk(
  'tracker/updateTracker',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await trackerService.updateTracker(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update tracker');
    }
  }
);

export const deleteTracker = createAsyncThunk(
  'tracker/deleteTracker',
  async (id, { rejectWithValue }) => {
    try {
      await trackerService.deleteTracker(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete tracker');
    }
  }
);

export const addWritingLog = createAsyncThunk(
  'tracker/addWritingLog',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await trackerService.addWritingLog(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to log writing session');
    }
  }
);

const getInitialLimit = () => {
  try {
    const saved = localStorage.getItem('shelfForge_maxActiveProjects');
    return saved ? parseInt(saved, 10) : 5;
  } catch {
    return 5;
  }
};

const initialState = {
  items: [],
  unlinkedWorks: [],
  stats: null,
  selectedTracker: null,
  viewMode: 'CARDS', // 'CARDS' | 'BOARD'
  filters: {
    status: 'ALL',
    contentType: 'ALL',
    neglected: false,
    search: '',
    sort: 'lastWorkedAt',
  },
  maxActiveLimit: getInitialLimit(),
  isLoading: false,
  isFetching: false,
  error: null,
};

const trackerSlice = createSlice({
  name: 'tracker',
  initialState,
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setMaxActiveLimit: (state, action) => {
      state.maxActiveLimit = action.payload;
      try {
        localStorage.setItem('shelfForge_maxActiveProjects', action.payload.toString());
      } catch (err) {
        console.error('Failed to save max active limit to localStorage:', err);
      }
    },
    clearSelectedTracker: (state) => {
      state.selectedTracker = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTrackers
      .addCase(fetchTrackers.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchTrackers.fulfilled, (state, action) => {
        state.isFetching = false;
        state.items = action.payload.data || [];
      })
      .addCase(fetchTrackers.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // fetchUnlinkedWorks
      .addCase(fetchUnlinkedWorks.fulfilled, (state, action) => {
        state.unlinkedWorks = action.payload.data || [];
      })
      // fetchTrackerStats
      .addCase(fetchTrackerStats.fulfilled, (state, action) => {
        state.stats = action.payload.data || null;
      })
      // createTracker
      .addCase(createTracker.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTracker.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.items.unshift(action.payload.data);
        }
      })
      .addCase(createTracker.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchTrackerById
      .addCase(fetchTrackerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrackerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTracker = action.payload.data || null;
      })
      .addCase(fetchTrackerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateTracker
      .addCase(updateTracker.fulfilled, (state, action) => {
        const updated = action.payload.data;
        if (updated) {
          const idx = state.items.findIndex((t) => t._id === updated._id);
          if (idx !== -1) state.items[idx] = updated;
          if (state.selectedTracker?._id === updated._id) {
            state.selectedTracker = { ...state.selectedTracker, ...updated };
          }
        }
      })
      // deleteTracker
      .addCase(deleteTracker.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
        if (state.selectedTracker?._id === action.payload) {
          state.selectedTracker = null;
        }
      })
      // addWritingLog
      .addCase(addWritingLog.fulfilled, (state, action) => {
        const { log, tracker: updatedTracker } = action.payload.data || {};
        if (updatedTracker) {
          const idx = state.items.findIndex((t) => t._id === updatedTracker._id);
          if (idx !== -1) state.items[idx] = updatedTracker;
          if (state.selectedTracker?._id === updatedTracker._id) {
            state.selectedTracker = {
              ...updatedTracker,
              logs: [log, ...(state.selectedTracker.logs || [])],
            };
          }
        }
      });
  },
});

export const { setViewMode, setFilters, setMaxActiveLimit, clearSelectedTracker, clearError } =
  trackerSlice.actions;

export const selectTrackers = (state) => state.tracker.items;
export const selectUnlinkedWorks = (state) => state.tracker.unlinkedWorks;
export const selectTrackerStats = (state) => state.tracker.stats;
export const selectSelectedTracker = (state) => state.tracker.selectedTracker;
export const selectTrackerViewMode = (state) => state.tracker.viewMode;
export const selectTrackerFilters = (state) => state.tracker.filters;
export const selectMaxActiveLimit = (state) => state.tracker.maxActiveLimit;
export const selectTrackerLoading = (state) => state.tracker.isLoading;
export const selectTrackerFetching = (state) => state.tracker.isFetching;

export default trackerSlice.reducer;
