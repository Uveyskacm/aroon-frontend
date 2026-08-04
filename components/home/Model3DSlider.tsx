"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Center, Bounds } from "@react-three/drei";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWebglSupport } from "@/lib/useWebglSupport";
import type { Locale } from "@/i18n/routing";

const HEADING: Record<Locale, string> = {
  tr: "3D Ürün Galerisi",
  en: "3D Product Gallery",
};

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

/** One <Canvas> per slide, mounted only for the active slide — multiple simultaneous WebGL contexts are expensive and unnecessary here. */
function Slide({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas camera={{ position: [3, 2, 5], fov: 40 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <color attach="background" args={["#f1f2f4"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <Environment files="/hdri/potsdamer_platz_1k.hdr" environmentIntensity={0.4} />
      <Suspense fallback={null}>
        <Model url={modelUrl} />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={2} maxDistance={12} />
    </Canvas>
  );
}

export function Model3DSlider({
  models,
  locale,
}: {
  models: { title: string; modelUrl: string }[];
  locale: Locale;
}) {
  const [index, setIndex] = useState(0);
  const webglSupported = useWebglSupport();

  if (!models.length || !webglSupported) return null;

  const current = models[index];
  const prev = () => setIndex((i) => (i - 1 + models.length) % models.length);
  const next = () => setIndex((i) => (i + 1) % models.length);

  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,64px)] py-[clamp(64px,8vw,128px)]">
      <h2 className="text-[length:var(--text-h2)] text-text-primary">{HEADING[locale]}</h2>
      <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-alt sm:aspect-[2/1]">
        <Slide key={current.modelUrl} modelUrl={current.modelUrl} />

        {models.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface-page/90 shadow-[var(--shadow-elevation-2)] hover:bg-surface-page"
            >
              <ChevronLeft aria-hidden size={20} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface-page/90 shadow-[var(--shadow-elevation-2)] hover:bg-surface-page"
            >
              <ChevronRight aria-hidden size={20} />
            </button>
          </>
        ) : null}
      </div>
      {current.title ? (
        <p className="mt-4 text-center text-[length:var(--text-body-sm)] text-text-muted">{current.title}</p>
      ) : null}
    </section>
  );
}
