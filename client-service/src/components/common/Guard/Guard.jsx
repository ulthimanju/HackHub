import React from 'react';
import { useAbility } from '../../../hooks/useAbility';

/**
 * Declarative role-based access control wrapper.
 *
 * Usage:
 *   <Guard allowed={['organizer']}>
 *     <Button>Create Event</Button>
 *   </Guard>
 *
 * Props:
 *   allowed   – string[]  list of roles that may see the children (case-insensitive)
 *   children  – ReactNode rendered if the current user has an allowed role
 *   fallback  – ReactNode rendered otherwise (default: null)
 */
export default function Guard({ allowed, children, fallback = null }) {
  const { isRole } = useAbility();
  if (!isRole(allowed)) return fallback;
  return <>{children}</>;
}
