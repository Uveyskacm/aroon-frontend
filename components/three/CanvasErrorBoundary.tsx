"use client";

import { Component, type ReactNode } from "react";

/**
 * WebGL/asset failures (a corrupt GLTF, a blocked or missing texture) throw
 * during render via R3F's Suspense-based loaders. Without this boundary
 * that throw propagates past the section and trips the route-level
 * error.tsx, taking down the whole page for what should be a purely
 * decorative element. Scoped here so a 3D failure just quietly drops the
 * scene instead.
 */
export class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
