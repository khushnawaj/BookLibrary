import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedService, postService } from '@/services';

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async ({ cursor, limit, type }, { rejectWithValue }) => {
    try {
      const response = await feedService.getFeed({ cursor, limit, type });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed');
    }
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'feed/toggleLike',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.toggleLike(postId);
      return { postId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

const initialState = {
  posts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  nextCursor: null,
  hasNextPage: true,
  isFetchingMore: false,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    resetFeed: (state) => {
      state.posts = [];
      state.status = 'idle';
      state.nextCursor = null;
      state.hasNextPage = true;
    },
    removePostFromFeed: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    updatePostInFeed: (state, action) => {
      const idx = state.posts.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.posts[idx] = {
          ...state.posts[idx],
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        if (action.meta.arg.cursor) {
          state.isFetchingMore = true;
        } else {
          state.status = 'loading';
        }
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isFetchingMore = false;
        
        if (action.meta.arg.cursor) {
          // append
          const existingIds = new Set(state.posts.map((p) => p._id));
          const newPosts = action.payload.posts.filter((p) => !existingIds.has(p._id));
          state.posts = [...state.posts, ...newPosts];
        } else {
          // replace
          state.posts = action.payload.posts;
        }

        state.nextCursor = action.payload.nextCursor;
        state.hasNextPage = action.payload.hasNextPage;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.isFetchingMore = false;
        state.error = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.isLiked = action.payload.liked;
          post.likesCount += action.payload.liked ? 1 : -1;
        }
      });
  },
});

export const { resetFeed, removePostFromFeed, updatePostInFeed } = feedSlice.actions;

export const selectAllPosts = (state) => state.feed.posts;
export const selectFeedStatus = (state) => state.feed.status;
export const selectFeedError = (state) => state.feed.error;

export default feedSlice.reducer;
