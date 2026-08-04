"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

/**
 * Procedural primitives, not imported GLTF models (Phase 6 §5) — a
 * precisely arranged set of cylinders (round pipes) and beveled boxes
 * (hollow sections), lit for controlled, not showy, metal reflection.
 */
function PipeGroup() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.05;
    const targetX = pointer.current.y * 0.08;
    const targetY = pointer.current.x * 0.08;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
    group.current.rotation.z += (targetY - group.current.rotation.z) * 0.05;
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
  });

  const material = (
    <meshStandardMaterial color="#a8afb8" metalness={0.88} roughness={0.28} />
  );

  return (
    <group ref={group}>
      <mesh position={[-1.4, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 3.2, 48, 1, true]} />
        {material}
      </mesh>
      <mesh position={[0.6, -0.4, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 2.4, 48, 1, true]} />
        {material}
      </mesh>
      <mesh position={[0.2, 1.1, 0.4]}>
        <boxGeometry args={[1.6, 0.5, 0.5]} />
        {material}
      </mesh>
      <mesh position={[-0.6, -1.2, 0.2]}>
        <boxGeometry args={[1.1, 0.36, 0.36]} />
        {material}
      </mesh>
    </group>
  );
}

export function HeroScene({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const [dpr, setDpr] = useState(1.5);
  const fired = useRef(false);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      onCreated={() => {
        if (!fired.current) {
          fired.current = true;
          onFirstFrame?.();
        }
      }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#04122e"]} />
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} />
      <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#174c9b" />
      <Environment files="/hdri/potsdamer_platz_1k.hdr" environmentIntensity={0.35} />
      <PipeGroup />
    </Canvas>
  );
}

export default HeroScene;
