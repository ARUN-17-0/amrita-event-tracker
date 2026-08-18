import { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../types';
import { auditLogService } from '../services/auditLogService';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setLogs(await auditLogService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  return { logs, data: logs, loading, error, refresh: fetch };
};
