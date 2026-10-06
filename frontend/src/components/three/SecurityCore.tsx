import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function SecurityRing({ radius, tubeRadius, rotationSpeed, color, opacity, axis }: {
  radius: number; tubeRadius: number; rotationSpeed: number;
  color: string; opacity: number; axis: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * rotationSpeed * axis[0];
    meshRef.current.rotation.y += delta * rotationSpeed * axis[1];
    meshRef.current.rotation.z += delta * rotationSpeed * axis[2];
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, tubeRadius, 32, 64]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        metalness={0.8}
        roughness={0.3}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.6, 2]} />
      <meshStandardMaterial
        color="#c77b3f"
        metalness={0.9}
        roughness={0.15}
        emissive="#c77b3f"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function ShieldGeometry() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  const edgesGeom = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(1.1, 0);
    return new THREE.EdgesGeometry(geo);
  }, []);

  return (
    <group ref={groupRef}>
      <CoreSphere />

      {/* Outer protection rings */}
      <SecurityRing radius={1.5} tubeRadius={0.012} rotationSpeed={0.12} color="#c77b3f" opacity={0.35} axis={[0, 1, 0.1]} />
      <SecurityRing radius={1.8} tubeRadius={0.008} rotationSpeed={-0.08} color="#9e9eab" opacity={0.2} axis={[0.3, 1, 0]} />
      <SecurityRing radius={2.1} tubeRadius={0.006} rotationSpeed={0.05} color="#72727e" opacity={0.12} axis={[0, 0.5, 0.8]} />

      {/* Octahedron wireframe shield */}
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial color="#53535c" transparent opacity={0.3} />
      </lineSegments>

      {/* Inner glow */}
      <pointLight color="#c77b3f" intensity={0.4} distance={4} decay={2} />
    </group>
  );
}

interface SecurityCoreProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SecurityCore: React.FC<SecurityCoreProps> = ({ className = '', size = 'lg' }) => {
  const height = size === 'lg' ? 500 : size === 'md' ? 350 : 200;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 3, 5]} intensity={0.4} color="#f5f3ef" />
        <directionalLight position={[-3, -2, -3]} intensity={0.15} color="#c77b3f" />
        <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
          <ShieldGeometry />
        </Float>
      </Canvas>
      {/* Subtle radial glow behind object */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(199,123,63,0.04) 0%, transparent 60%)',
      }} />
    </div>
  );
};
