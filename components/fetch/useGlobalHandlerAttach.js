import { useEffect, useRef } from "react";
import createSlide, { Axis } from "../slide";

export default function useGlobalHandlerAttach(
  elRef,
  onStart,
  onMove,
  onEnd,
  disabled
) {
  const touchStartRef = useRef();
  const touchMoveRef = useRef();
  const touchEndRef = useRef();

  useEffect(() => {
    touchStartRef.current = onStart;
    touchMoveRef.current = onMove;
    touchEndRef.current = onEnd;
  });

  useEffect(
    () => {
      if (disabled) {
        return () => undefined;
      }

      const _onStart = (...args) => touchStartRef.current(...args);
      const _onMove = (...args) => touchMoveRef.current(...args);
      const _onEnd = (...args) => touchEndRef.current(...args);

      return createSlide({
        el: elRef.current,
        onStart: _onStart,
        onMove: _onMove,
        onEnd: _onEnd,
        axis: Axis.Y,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );
}
