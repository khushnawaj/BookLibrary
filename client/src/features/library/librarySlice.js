import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { libraryService } from '@/services';

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const fetchLibraryEntries = createAsyncThunk(
  'library/fetchEntries',
  async (params, { rejectWithValue }) => {
    try {
      const response = await libraryService.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch library');
    }
  }
);

export const fetchLibraryEntryById = createAsyncThunk(
  'library/fetchEntryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await libraryService.getById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch library entry');
    }
  }
);

export const addToLibrary = createAsyncThunk(
  'library/addEntry',
  async (data, { rejectWithValue }) => {
    try {
      const response = await libraryService.add(data);
      return response.data;
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const detailMsg = errorData.errors.map((e) => e.message).join(', ');
        return rejectWithValue(`${errorData.message}: ${detailMsg}`);
      }
      return rejectWithValue(errorData?.message || 'Failed to add to library');
    }
  }
);

export const updateLibraryEntry = createAsyncThunk(
  'library/updateEntry',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await libraryService.update(id, data);
      return response.data;
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const detailMsg = errorData.errors.map((e) => e.message).join(', ');
        return rejectWithValue(`${errorData.message}: ${detailMsg}`);
      }
      return rejectWithValue(errorData?.message || 'Failed to update library entry');
    }
  }
);

export const removeFromLibrary = createAsyncThunk(
  'library/removeEntry',
  async (id, { rejectWithValue }) => {
    try {
      await libraryService.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from library');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  entries: [],
  selectedEntry: null,
  filters: { shelfType: '', search: '', sort: '' },
  isLoading: false,
  isFetching: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setLibraryPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedEntry: (state) => {
      state.selectedEntry = null;
    },
    clearLibraryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLibraryEntries
      .addCase(fetchLibraryEntries.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchLibraryEntries.fulfilled, (state, action) => {
        state.isFetching = false;
        state.entries = action.payload.data?.entries ?? [];
        if (action.payload.meta) {
          state.pagination = {
            ...state.pagination,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
        }
      })
      .addCase(fetchLibraryEntries.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // fetchLibraryEntryById
      .addCase(fetchLibraryEntryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLibraryEntryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEntry = action.payload.data?.entry ?? null;
      })
      .addCase(fetchLibraryEntryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // addToLibrary
      .addCase(addToLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToLibrary.fulfilled, (state, action) => {
        state.isLoading = false;
        const entry = action.payload.data?.entry;
        if (entry) state.entries.unshift(entry);
      })
      .addCase(addToLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateLibraryEntry
      .addCase(updateLibraryEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLibraryEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data?.entry;
        if (updated) {
          const idx = state.entries.findIndex((e) => e._id === updated._id);
          if (idx !== -1) {
            if (state.filters.shelfType && updated.shelfType !== state.filters.shelfType) {
              state.entries.splice(idx, 1);
            } else {
              state.entries[idx] = updated;
            }
          }
          if (state.selectedEntry?._id === updated._id) state.selectedEntry = updated;
        }
      })
      .addCase(updateLibraryEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // removeFromLibrary
      .addCase(removeFromLibrary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromLibrary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = state.entries.filter((e) => e._id !== action.payload);
      })
      .addCase(removeFromLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setLibraryFilters,
  setLibraryPage,
  clearSelectedEntry,
  clearLibraryError,
} = librarySlice.actions;

export const selectLibraryEntries = (state) => state.library.entries;
export const selectSelectedEntry = (state) => state.library.selectedEntry;
export const selectLibraryLoading = (state) => state.library.isLoading;
export const selectLibraryFetching = (state) => state.library.isFetching;
export const selectLibraryError = (state) => state.library.error;
export const selectLibraryPagination = (state) => state.library.pagination;
export const selectLibraryFilters = (state) => state.library.filters;

export default librarySlice.reducer;
