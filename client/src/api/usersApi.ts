import { apiSlice } from './apiSlice';
import type { User } from '../types';

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/api/users',
      providesTags: ['Users'],
    }),
    
    getUserById: builder.query<User, string>({
      query: (id) => `/api/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    
    createUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/api/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
    
    updateUser: builder.mutation<User, { id: string; userData: Partial<User> }>({
      query: ({ id, userData }) => ({
        url: `/api/users/${id}`,
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'Users',
      ],
    }),
    
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;