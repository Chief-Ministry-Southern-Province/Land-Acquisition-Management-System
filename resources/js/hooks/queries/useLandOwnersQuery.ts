import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';
import {
  getPropertyOwners,
  getPropertyOwner,
  createPropertyOwner,
  updatePropertyOwner,
  deletePropertyOwner,
} from '@/services/propertyOwnerManagement';

export const PROPERTY_OWNERS_QUERY_KEY = ['land-owners'] as const;

export function useLandOwnersQuery(initialData?: PropertyOwner[]) {
  return useQuery({
    queryKey: PROPERTY_OWNERS_QUERY_KEY,
    queryFn: getPropertyOwners,
    initialData,
  });
}

export function useLandOwnerQuery(id: string, initialData?: PropertyOwner) {
  return useQuery({
    queryKey: [...PROPERTY_OWNERS_QUERY_KEY, id],
    queryFn: () => getPropertyOwner(id),
    enabled: Boolean(id),
    initialData,
  });
}

export function useCreateLandOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<PropertyOwner, 'id' | 'created_at' | 'updated_at'>,
    ) => createPropertyOwner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_OWNERS_QUERY_KEY });
    },
  });
}

export function useUpdateLandOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<PropertyOwner, 'id' | 'created_at' | 'updated_at'>;
    }) => updatePropertyOwner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_OWNERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PROPERTY_OWNERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteLandOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePropertyOwner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_OWNERS_QUERY_KEY });
    },
  });
}
