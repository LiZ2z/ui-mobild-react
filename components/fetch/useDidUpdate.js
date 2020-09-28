import { useEffect, useRef } from "react";

export default function useDidUpdate(callback, deps = []) {
  const isUpdate = useRef(false);

  useEffect(() => {
    if (!isUpdate.current) {
      isUpdate.current = true;
      return () => undefined;
    }

    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
