import { useEffect, useRef } from "react";

/**
 * The same as useEffect, but does not run the effect on the first render.
 */
export const useEffectSkipFirstRender: typeof useEffect = (effect, deps) => {
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      effect();
    }
  }, deps);
};
