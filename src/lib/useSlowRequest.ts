import { useEffect, useRef, useState } from "react";

export function useSlowRequest(active: boolean, delayMs = 6000) {
  const [slow, setSlow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }
    timer.current = setTimeout(() => setSlow(true), delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      setSlow(false);
    };
  }, [active, delayMs]);

  return slow;
}
