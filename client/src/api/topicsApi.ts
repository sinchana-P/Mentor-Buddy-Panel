import { apiSlice } from './apiSlice';
import type { Topic } from '../types';

export const topicsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopics: builder.query<Topic[], { domain?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.domain) queryParams.append('domain', params.domain);
        
        return {
          url: '/api/topics',
          params: queryParams,
        };
      },
      providesTags: ['Topics'],
    }),
    
    createTopic: builder.mutation<Topic, Partial<Topic>>({
      query: (topicData) => ({
        url: '/api/topics',
        method: 'POST',
        body: topicData,
      }),
      invalidatesTags: ['Topics'],
    }),
    
    updateTopic: builder.mutation<Topic, { id: string; topicData: Partial<Topic> }>({
      query: ({ id, topicData }) => ({
        url: `/api/topics/${id}`,
        method: 'PATCH',
        body: topicData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Topic', id },
        'Topics',
      ],
    }),
    
    deleteTopic: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/topics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Topics'],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = topicsApi;