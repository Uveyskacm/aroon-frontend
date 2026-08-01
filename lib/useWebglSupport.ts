"use client";

import { useSyncExternalStore } from "react";

function checkWebgl2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

let cached: boolean | null = null;

/** Feature-detected WebGL2 check (Phase 6 §7) — a breakpoint alone isn't sufficient. */
export function useWebglSupport(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (cached === null) cached = checkWebgl2();
      return cached;
    },
    () => false,
  );
}
