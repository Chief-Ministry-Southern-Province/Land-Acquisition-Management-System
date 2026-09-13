import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project } from '@/services/projectsManagementService';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  submitProject,
} from '@/services/projectsManagementService';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

export function useProjectsQuery(initialData?: Project[]) {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: getProjects,
    initialData,
  });
}

export function useProjectQuery(id: string, initialData?: Project) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
    initialData,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
        parcel_ids?: string[];
      },
    ) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
        parcel_ids?: string[];
      };
    }) => updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PROJECTS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useSubmitProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submitProject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PROJECTS_QUERY_KEY, id],
      });
    },
  });
}
