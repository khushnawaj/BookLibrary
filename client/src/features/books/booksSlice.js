import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  selectedBook: null,
  filters: { search: '', genre: '', shelfType: '' },
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 0 },
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks: (state, action) => {
      state.items = action.payload;
    },
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  setBooks,
  setSelectedBook,
  setFilters,
  setLoading,
  setError,
  setPagination,
} = booksSlice.actions;
export default booksSlice.reducer;
