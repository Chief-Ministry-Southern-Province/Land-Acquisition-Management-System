import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AUDIT_LOGS_QUERY_KEY } from './queries/useAuditLogsQuery';
import { PROPERTY_OWNERS_QUERY_KEY } from './queries/useLandOwnersQuery';
import { LAND_PARCELS_QUERY_KEY } from './queries/useLandParcelsQuery';
import { PROJECTS_QUERY_KEY } from './queries/useProjectsQuery';
import { REPORTS_QUERY_KEY } from './queries/useReportsQuery';

export function useRealtimeCacheSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Echo) {
      // Listen to project channel events
      const projectsChannel = window.Echo.channel('projects');
      projectsChannel.listen('.ProjectUpdated', () => {
        queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY] });
      });

      // Listen to land parcel channel events
      const parcelsChannel = window.Echo.channel('land-parcels');
      parcelsChannel.listen('.ParcelUpdated', () => {
        queryClient.invalidateQueries({ queryKey: LAND_PARCELS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY] });
      });

      // Listen to property owners channel events
      const ownersChannel = window.Echo.channel('property-owners');
      ownersChannel.listen('.OwnerUpdated', () => {
        queryClient.invalidateQueries({ queryKey: PROPERTY_OWNERS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY] });
      });

      // Listen to audit logs channel events
      const auditChannel = window.Echo.channel('audit-logs');
      auditChannel.listen('.LogCreated', () => {
        queryClient.invalidateQueries({ queryKey: [AUDIT_LOGS_QUERY_KEY] });
      });

      return () => {
        projectsChannel.stopListening('.ProjectUpdated');
        parcelsChannel.stopListening('.ParcelUpdated');
        ownersChannel.stopListening('.OwnerUpdated');
        auditChannel.stopListening('.LogCreated');
      };
    }
  }, [queryClient]);
}
