import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/constants';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    // You can add common headers here if needed
    return headers;
  },
});

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Users',
    'User',
    'Mentors',
    'Mentor',
    'Buddies',
    'Buddy',
    'Tasks',
    'Task',
    'Submissions',
    'Topics',
    'Progress',
    'Portfolio',
    'Resources',
    'Curriculum',
  ],
  endpoints: () => ({}),
});