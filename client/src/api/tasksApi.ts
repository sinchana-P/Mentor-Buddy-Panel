import { apiSlice } from './apiSlice';
import type { Task, Submission } from '../types';

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], { status?: string; search?: string; buddyId?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.buddyId) queryParams.append('buddyId', params.buddyId);
        
        return {
          url: '/api/tasks',
          params: queryParams,
        };
      },
      providesTags: ['Tasks'],
    }),
    
    getTaskById: builder.query<Task, string>({
      query: (id) => `/api/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (taskData) => ({
        url: '/api/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Tasks'],
    }),
    
    updateTask: builder.mutation<Task, { id: string; taskData: Partial<Task> }>({
      query: ({ id, taskData }) => ({
        url: `/api/tasks/${id}`,
        method: 'PATCH',
        body: taskData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        'Tasks',
      ],
    }),
    
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
    
    createSubmission: builder.mutation<Submission, Partial<Submission>>({
      query: (submissionData) => ({
        url: '/api/submissions',
        method: 'POST',
        body: submissionData,
      }),
      invalidatesTags: (result) => [
        { type: 'Task', id: result?.taskId },
        'Tasks',
        'Submissions',
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateSubmissionMutation,
} = tasksApi;