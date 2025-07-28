import { apiSlice } from './apiSlice';
import type { Mentor, Buddy } from '../types';

export const mentorsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMentors: builder.query<Mentor[], { domain?: string; search?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.domain) queryParams.append('domain', params.domain);
        if (params.search) queryParams.append('search', params.search);
        
        return {
          url: '/api/mentors',
          params: queryParams,
        };
      },
      providesTags: ['Mentors'],
    }),
    
    getMentorById: builder.query<Mentor, string>({
      query: (id) => `/api/mentors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Mentor', id }],
    }),
    
    getMentorBuddies: builder.query<Buddy[], { mentorId: string; status?: string }>({
      query: ({ mentorId, status }) => {
        const queryParams = new URLSearchParams();
        if (status) queryParams.append('status', status);
        
        return {
          url: `/api/mentors/${mentorId}/buddies`,
          params: queryParams,
        };
      },
      providesTags: (result, error, { mentorId }) => [
        { type: 'Mentor', id: mentorId },
        'Buddies',
      ],
    }),
    
    createMentor: builder.mutation<Mentor, Partial<Mentor>>({
      query: (mentorData) => ({
        url: '/api/mentors',
        method: 'POST',
        body: mentorData,
      }),
      invalidatesTags: ['Mentors'],
    }),
    
    updateMentor: builder.mutation<Mentor, { id: string; mentorData: Partial<Mentor> }>({
      query: ({ id, mentorData }) => ({
        url: `/api/mentors/${id}`,
        method: 'PATCH',
        body: mentorData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Mentor', id },
        'Mentors',
      ],
    }),
    
    deleteMentor: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/mentors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Mentors'],
    }),
  }),
});

export const {
  useGetMentorsQuery,
  useGetMentorByIdQuery,
  useGetMentorBuddiesQuery,
  useCreateMentorMutation,
  useUpdateMentorMutation,
  useDeleteMentorMutation,
} = mentorsApi;