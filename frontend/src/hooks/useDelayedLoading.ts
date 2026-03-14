import { useState, useEffect } from 'react';

export function useDelayedLoading(isLoading: boolean, delay: number = 300) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      timeout = setTimeout(() => setShowLoading(true), delay);
    } else {
      timeout = setTimeout(() => setShowLoading(false), 0);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, delay]);

  return showLoading;
}
