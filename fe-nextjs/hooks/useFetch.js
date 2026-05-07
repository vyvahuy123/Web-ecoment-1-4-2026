import { useState, useEffect, useCallback, useRef } from "react";

export function useFetch(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  const fetchFnRef = useRef(fetchFn);
  useEffect(() => { fetchFnRef.current = fetchFn; }, [fetchFn]);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current(...args);
      // ✅ Service đã .then(r => r.data) rồi → dùng thẳng result
      setData(result);
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message
               ?? err?.message
               ?? "Đã có lỗi xảy ra";
      setError(msg);
      // ❌ Bỏ throw err — tránh crash UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, execute, refetch };
}

export default useFetch;