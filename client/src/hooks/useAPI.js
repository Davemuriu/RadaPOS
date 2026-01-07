import { useState } from "react";

export function useApi(fn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      return await fn(...args);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error };
}
