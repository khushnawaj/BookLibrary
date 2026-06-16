import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '@/services';

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getOverview();
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

export const deleteGoal = createAsyncThunk(
  'analytics/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      await analyticsService.deleteGoal(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete goal');
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
    booksThisYear: 0,
    avgBooksPerMonth: 0,
    avgDaysPerBook: null,
    currentlyReading: 0,
    wishlistCount: 0,
    uniqueGenres: 0,
  },
  genreDistribution: [],
  booksPerMonth: [],
  topRatedBooks: [],
  goals: [],
  achievements: [],
  isLoading: false,
  isGoalLoading: false,
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
        state.topRatedBooks = action.payload.data.topRatedBooks || [];
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
      .addCase(createGoal.pending, (state) => {
        state.isGoalLoading = true;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isGoalLoading = false;
        state.goals.unshift(action.payload.data.goal);
      })
      .addCase(createGoal.rejected, (state) => {
        state.isGoalLoading = false;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g._id !== action.payload);
      });
  },
});

export const selectAnalytics = (state) => state.analytics;
export default analyticsSlice.reducer;
