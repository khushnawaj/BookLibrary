import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService } from '@/services';

export const fetchPost = createAsyncThunk(
  'post/fetchPost',
  async (id, { rejectWithValue }) => {
    try {
      const res = await postService.getPost(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await postService.deletePost(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete post');
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState: {
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentPost: (state) => {
      state.current = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPost.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.current = null;
        state.status = 'idle';
      });
  },
});

export const { clearCurrentPost } = postSlice.actions;
export const selectCurrentPost = (state) => state.post.current;
export const selectPostStatus = (state) => state.post.status;
export default postSlice.reducer;
