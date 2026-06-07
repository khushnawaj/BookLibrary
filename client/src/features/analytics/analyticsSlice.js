import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '@/services';

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getAnalytics();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchGoals = createAsyncThunk(
  'analytics/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getGoals();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch goals');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'analytics/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getAchievements();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

export const createGoal = createAsyncThunk(
  'analytics/createGoal',
  async (data, { rejectWithValue }) => {
    try {
      const response = await analyticsService.createGoal(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create goal');
    }
  }
);

const initialState = {
  overview: {
    totalBooksRead: 0,
    totalPagesRead: 0,
    averageRating: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
  genreDistribution: [],
  booksPerMonth: [],
  goals: [],
  achievements: [],
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload.data.overview;
        state.genreDistribution = action.payload.data.genreDistribution;
        state.booksPerMonth = action.payload.data.booksPerMonth;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.goals = action.payload.data.goals;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievements = action.payload.data.achievements;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload.data.goal);
      });
  },
});

export const selectAnalytics = (state) => state.analytics;
export default analyticsSlice.reducer;
