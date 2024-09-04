import { useEffect, useState } from "react";

export function useSSE<T>(
  url: string,
  options?: EventSourceInit
): { data?: T; error?: Event; closeFn?: () => void } {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Event>();
  const [closeFn, setCloseFn] = useState<() => void>();

  useEffect(() => {
    const eventSource = new EventSource(url, options);
    setCloseFn(() => eventSource.close.bind(eventSource));

    eventSource.onmessage = (event) => {
      setData((old) =>
        event.data === JSON.stringify(old) ? old : JSON.parse(event.data)
      );
    };

    eventSource.onerror = (err) => {
      setError(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { data, error, closeFn };
}
