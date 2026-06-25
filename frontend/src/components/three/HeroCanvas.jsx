'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import styles from './HeroCanvas.module.css';

// Animated floating geometry in center
function FloatingGeometry() {
  const meshRef = useRef();
  const mesh2Ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.4;
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.x = -t * 0.15;
      mesh2Ref.current.rotation.z = t * 0.2;
      mesh2Ref.current.position.y = Math.cos(t * 0.4) * 0.5;
    }
  });

  return (
    <>
      {/* Main torus knot */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.2, 0.35, 180, 32]} />
        <meshStandardMaterial
          color="#6c63ff"
          emissive="#6c63ff"
          emissiveIntensity={0.4}
          wireframe={false}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Outer wireframe ring */}
      <mesh ref={mesh2Ref} position={[0, 0, 0]} scale={1.6}>
        <torusGeometry args={[1.2, 0.02, 16, 80]} />
        <meshBasicMaterial color="#00f5d4" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

// Mouse-reactive particle field
function ParticleField() {
  const pointsRef = useRef();
  const { mouse } = useThree();

  const count = 3500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 7;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      pointsRef.current.rotation.x += (mouse.y * 0.08 - pointsRef.current.rotation.x) * 0.05;
      pointsRef.current.rotation.z += (-mouse.x * 0.08 - pointsRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6c63ff"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// Grid floor
function GridFloor() {
  return (
    <gridHelper
      args={[30, 30, '#6c63ff', '#1a1a30']}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function HeroCanvas() {
  return (
    <div className={styles.canvas}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#6c63ff" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#00f5d4" />
        <spotLight position={[0, 8, 0]} intensity={1.5} color="#ffffff" castShadow />

        <FloatingGeometry />
        <ParticleField />
        <GridFloor />
      </Canvas>
    </div>
  );
}
