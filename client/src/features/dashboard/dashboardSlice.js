import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const initialState = {
  stats: {
    totalBooks: 0,
    readBooks: 0,
    readingBooks: 0,
    wishlistCount: 0,
    droppedBooks: 0,
  },
  recentBooks: [],
  recentActivity: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        const { stats, recentBooks, recentActivity } = action.payload.data ?? {};
        if (stats) state.stats = stats;
        if (recentBooks) state.recentBooks = recentBooks;
        if (recentActivity) state.recentActivity = recentActivity;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectRecentBooks = (state) => state.dashboard.recentBooks;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectDashboardLoading = (state) => state.dashboard.isLoading;

export default dashboardSlice.reducer;
