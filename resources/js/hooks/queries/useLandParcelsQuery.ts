import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LandParcel } from '@/services/landParcelManagementService';
import {
  getLandParcels,
  getLandParcel,
  createLandParcel,
  updateLandParcel,
  deleteLandParcel,
} from '@/services/landParcelManagementService';

export const LAND_PARCELS_QUERY_KEY = ['land-parcels'] as const;

export function useLandParcelsQuery(initialData?: LandParcel[]) {
  return useQuery({
    queryKey: LAND_PARCELS_QUERY_KEY,
    queryFn: getLandParcels,
    initialData,
  });
}

export function useLandParcelQuery(id: string, initialData?: LandParcel) {
  return useQuery({
    queryKey: [...LAND_PARCELS_QUERY_KEY, id],
    queryFn: () => getLandParcel(id),
    enabled: Boolean(id),
    initialData,
  });
}

export function useCreateLandParcelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Omit<LandParcel, 'id' | 'created_at' | 'updated_at'> & {
        property_owner_ids?: string[] | null;
      },
    ) => createLandParcel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAND_PARCELS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateLandParcelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<LandParcel, 'id' | 'created_at' | 'updated_at'> & {
        property_owner_ids?: string[] | null;
      };
    }) => updateLandParcel(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LAND_PARCELS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LAND_PARCELS_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteLandParcelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLandParcel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAND_PARCELS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
