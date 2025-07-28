import { apiSlice } from './apiSlice';
import type { Resource } from '../types';

export const resourcesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getResources: builder.query<Resource[], { category?: string; difficulty?: string; type?: string; search?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.type) queryParams.append('type', params.type);
        if (params.search) queryParams.append('search', params.search);
        
        return {
          url: '/api/resources',
          params: queryParams,
        };
      },
      providesTags: ['Resources'],
    }),
    
    getResourceById: builder.query<Resource, string>({
      query: (id) => `/api/resources/${id}`,
      providesTags: (result, error, id) => [{ type: 'Resources', id }],
    }),
    
    createResource: builder.mutation<Resource, Partial<Resource>>({
      query: (resourceData) => ({
        url: '/api/resources',
        method: 'POST',
        body: resourceData,
      }),
      invalidatesTags: ['Resources'],
    }),
    
    updateResource: builder.mutation<Resource, { id: string; resourceData: Partial<Resource> }>({
      query: ({ id, resourceData }) => ({
        url: `/api/resources/${id}`,
        method: 'PATCH',
        body: resourceData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Resources', id },
        'Resources',
      ],
    }),
    
    deleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/resources/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resources'],
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useGetResourceByIdQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} = resourcesApi;