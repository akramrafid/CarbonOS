import { useState, useEffect } from 'react';

/**
 * A custom hook to listen for real-time credit status updates.
 * In production, this would use Supabase Realtime or standard WebSockets.
 * 
 * @param {string} initialStatus - The starting status (e.g. 'AVAILABLE')
 * @param {string} creditId - The credit ID to subscribe to
 * @returns {string} The current real-time status
 */
export function useRealtimeStatus(initialStatus, creditId) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    // -------------------------------------------------------------
    // MOCK REAL-TIME IMPLEMENTATION
    // -------------------------------------------------------------
    // For demo purposes, we randomly upgrade the status over time
    // to simulate the pipeline executing in the background.
    
    let timer;
    const scheduleNext = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (status === 'AVAILABLE') {
        timer = setTimeout(() => setStatus('RESERVED'), 8000 + Math.random() * 5000);
      } else if (status === 'RESERVED') {
        timer = setTimeout(() => setStatus('SOLD'), 4000 + Math.random() * 3000);
      } else if (status === 'SOLD') {
        timer = setTimeout(() => setStatus('SETTLED'), 6000 + Math.random() * 4000);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'hidden') {
        if (timer) clearTimeout(timer);
      } else {
        scheduleNext();
      }
    };

    scheduleNext();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [status, creditId]);

  return status;
}
