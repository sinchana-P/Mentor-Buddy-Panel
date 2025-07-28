import { apiSlice } from './apiSlice';
import type { Curriculum } from '../types';

export const curriculumApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurriculum: builder.query<Curriculum[], { domain?: string; search?: string }>({  
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.domain) queryParams.append('domain', params.domain);
        if (params.search) queryParams.append('search', params.search);
        
        return {
          url: '/api/curriculum',
          params: queryParams,
        };
      },
      providesTags: ['Curriculum'],
    }),
    
    getCurriculumById: builder.query<Curriculum, string>({  
      query: (id) => `/api/curriculum/${id}`,
      providesTags: (result, error, id) => [{ type: 'Curriculum', id }],
    }),
    
    createCurriculum: builder.mutation<Curriculum, Partial<Curriculum>>({  
      query: (curriculumData) => ({
        url: '/api/curriculum',
        method: 'POST',
        body: curriculumData,
      }),
      invalidatesTags: ['Curriculum'],
    }),
    
    updateCurriculum: builder.mutation<Curriculum, { id: string; curriculumData: Partial<Curriculum> }>({  
      query: ({ id, curriculumData }) => ({
        url: `/api/curriculum/${id}`,
        method: 'PATCH',
        body: curriculumData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Curriculum', id },
        'Curriculum',
      ],
    }),
    
    deleteCurriculum: builder.mutation<void, string>({  
      query: (id) => ({
        url: `/api/curriculum/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Curriculum'],
    }),
  }),
});

export const {
  useGetCurriculumQuery,
  useGetCurriculumByIdQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
} = curriculumApi;