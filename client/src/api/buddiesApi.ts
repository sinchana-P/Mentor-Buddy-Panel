import { apiSlice } from './apiSlice';
import type { Buddy, Task, BuddyTopicProgress, PortfolioItem } from '../types';

export const buddiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuddies: builder.query<Buddy[], { status?: string; domain?: string; search?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.domain) queryParams.append('domain', params.domain);
        if (params.search) queryParams.append('search', params.search);
        
        return {
          url: '/api/buddies',
          params: queryParams,
        };
      },
      providesTags: ['Buddies'],
    }),
    
    getBuddyById: builder.query<Buddy, string>({
      query: (id) => `/api/buddies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Buddy', id }],
    }),
    
    getBuddyTasks: builder.query<Task[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/tasks`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddy', id: buddyId },
        'Tasks',
      ],
    }),
    
    getBuddyProgress: builder.query<BuddyTopicProgress[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/progress`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddy', id: buddyId },
        'Progress',
      ],
    }),
    
    updateBuddyProgress: builder.mutation<BuddyTopicProgress, { buddyId: string; topicId: string; checked: boolean }>({
      query: ({ buddyId, topicId, checked }) => ({
        url: `/api/buddies/${buddyId}/progress/${topicId}`,
        method: 'PATCH',
        body: { checked },
      }),
      invalidatesTags: (result, error, { buddyId }) => [
        { type: 'Buddy', id: buddyId },
        'Progress',
      ],
    }),
    
    getBuddyPortfolio: builder.query<PortfolioItem[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/portfolio`,
      providesTags: (result, error, buddyId) => [
        { type: 'Buddy', id: buddyId },
        'Portfolio',
      ],
    }),
    
    createBuddy: builder.mutation<Buddy, Partial<Buddy>>({
      query: (buddyData) => ({
        url: '/api/buddies',
        method: 'POST',
        body: buddyData,
      }),
      invalidatesTags: ['Buddies'],
    }),
    
    assignBuddyToMentor: builder.mutation<Buddy, { buddyId: string; mentorId: string }>({
      query: ({ buddyId, mentorId }) => ({
        url: `/api/buddies/${buddyId}/assign`,
        method: 'PATCH',
        body: { mentorId },
      }),
      invalidatesTags: (result, error, { buddyId, mentorId }) => [
        { type: 'Buddy', id: buddyId },
        { type: 'Mentor', id: mentorId },
        'Buddies',
        'Mentors',
      ],
    }),
    
    updateBuddy: builder.mutation<Buddy, { id: string; buddyData: Partial<Buddy> }>({
      query: ({ id, buddyData }) => ({
        url: `/api/buddies/${id}`,
        method: 'PATCH',
        body: buddyData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Buddy', id },
        'Buddies',
      ],
    }),
  }),
});

export const {
  useGetBuddiesQuery,
  useGetBuddyByIdQuery,
  useGetBuddyTasksQuery,
  useGetBuddyProgressQuery,
  useUpdateBuddyProgressMutation,
  useGetBuddyPortfolioQuery,
  useCreateBuddyMutation,
  useAssignBuddyToMentorMutation,
  useUpdateBuddyMutation,
} = buddiesApi;