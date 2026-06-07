import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookService } from '@/services';

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookService.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch books');
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookService.getById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch book');
    }
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (data, { rejectWithValue }) => {
    try {
      const response = await bookService.create(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create book');
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await bookService.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update book');
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await bookService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete book');
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  selectedBook: null,
  filters: { search: '', genre: '', sort: '' },
  isLoading: false,
  isFetching: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic delete
    optimisticDelete: (state, action) => {
      state.items = state.items.filter((b) => b._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isFetching = false;
        state.items = action.payload.data?.books ?? [];
        if (action.payload.meta) {
          state.pagination = {
            ...state.pagination,
            total: action.payload.meta.total,
            totalPages: action.payload.meta.totalPages,
          };
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBook = action.payload.data?.book ?? null;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createBook
      .addCase(createBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.isLoading = false;
        const newBook = action.payload.data?.book;
        if (newBook) state.items.unshift(newBook);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateBook
      .addCase(updateBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.data?.book;
        if (updated) {
          const idx = state.items.findIndex((b) => b._id === updated._id);
          if (idx !== -1) state.items[idx] = updated;
          if (state.selectedBook?._id === updated._id) state.selectedBook = updated;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // deleteBook
      .addCase(deleteBook.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, setPage, clearSelectedBook, clearError, optimisticDelete } =
  booksSlice.actions;

export const selectBooks = (state) => state.books.items;
export const selectSelectedBook = (state) => state.books.selectedBook;
export const selectBooksLoading = (state) => state.books.isLoading;
export const selectBooksFetching = (state) => state.books.isFetching;
export const selectBooksError = (state) => state.books.error;
export const selectBooksPagination = (state) => state.books.pagination;
export const selectBooksFilters = (state) => state.books.filters;

export default booksSlice.reducer;
