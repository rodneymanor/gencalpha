import { useState, useEffect } from "react";

import { useAuth } from "@/contexts/auth-context";
import { RBACService, type RBACContext } from "@/core/auth/rbac";

interface UseRBACReturn {
  context: RBACContext | null;
  loading: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  isSuperAdmin: boolean;
  accessibleCoaches: string[];
}

// Calculate derived permissions
function calculatePermissions(context: RBACContext | null) {
  if (!context) {
    return {
      canRead: false,
      canWrite: false,
      canDelete: false,
      isSuperAdmin: false,
      accessibleCoaches: [],
    };
  }

  return {
    canRead: context.accessibleCoaches.length > 0,
    canWrite: context.role === "coach" || context.role === "creator" || context.isSuperAdmin,
    canDelete: context.role === "coach" || context.isSuperAdmin,
    isSuperAdmin: context.isSuperAdmin ?? false,
    accessibleCoaches: context.accessibleCoaches ?? [],
  };
}

export function useRBAC(): UseRBACReturn {
  const { user } = useAuth();
  const [context, setContext] = useState<RBACContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRBACContext() {
      if (!user?.uid) {
        setContext(null);
        setLoading(false);
        return;
      }

      try {
        const rbacContext = await RBACService.getRBACContext(user.uid);
        setContext(rbacContext);
      } catch (error) {
        console.error("Failed to load RBAC context:", error);
        setContext(null);
      } finally {
        setLoading(false);
      }
    }

    loadRBACContext();
  }, [user?.uid]);

  const permissions = calculatePermissions(context);

  return {
    context,
    loading,
    ...permissions,
  };
}
