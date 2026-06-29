'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Demo thumbnails to show on the globe (projects + other e-commerce/Shopify images)
const GLOBE_IMAGES = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=90',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=90',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=90',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=90',
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=90',
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&q=90',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=90',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=90',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=90',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=90',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=90',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=90',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=90',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=90',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=90',
];

// We reserve 3 specific slots for the HTML flying cards to ensure they fit perfectly in the grid.
const PROJECT_SLOTS = [
  { row: 4, col: 2 },   // Project 1
  { row: 6, col: 18 },  // Project 2
  { row: 3, col: 16 }   // Project 3
];

function ImageTiles() {
  const textures = useTexture(GLOBE_IMAGES);
  const radius = 2.5;
  const rows = 12; // More rows for better resolution
  const cols = 24; // More columns

  const thetaLength = Math.PI / rows;
  const phiLength = (2 * Math.PI) / cols;

  // We add a tiny gap by slightly reducing the arc lengths of each tile
  const thetaGap = 0.02;
  const phiGap = 0.02;

  const tiles = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Check if this slot is reserved for a flying project card
        const reservedIndex = PROJECT_SLOTS.findIndex(slot => slot.row === r && slot.col === c);
        
        let texture;
        if (reservedIndex !== -1) {
          // Use the specific project texture (first 3 images)
          texture = textures[reservedIndex];
        } else {
          // Use a random texture from the rest
          const textureIndex = 3 + ((r * cols + c * 7 + (r % 2) * 3) % (textures.length - 3));
          texture = textures[textureIndex];
        }

        arr.push({
          row: r,
          col: c,
          texture
        });
      }
    }
    return arr;
  }, [textures, rows, cols]);

  return (
    <group>
      {tiles.map((tile, i) => (
        <mesh key={i}>
          <sphereGeometry 
            args={[
              radius, 
              16, 
              16, 
              tile.col * phiLength + phiGap/2, 
              phiLength - phiGap, 
              tile.row * thetaLength + thetaGap/2, 
              thetaLength - thetaGap
            ]} 
          />
          <meshBasicMaterial map={tile.texture} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function ProjectAnchors() {
  const radius = 2.5;
  const rows = 12;
  const cols = 24;
  
  const thetaLength = Math.PI / rows;
  const phiLength = (2 * Math.PI) / cols;

  return (
    <group>
      {PROJECT_SLOTS.map((slot, index) => {
        // Calculate the center angle of the slot
        const thetaCenter = slot.row * thetaLength + (thetaLength / 2);
        const phiCenter = slot.col * phiLength + (phiLength / 2);
        
        // We use YXZ rotation to properly align the flat HTML element to the surface of the sphere
        return (
          <group key={index} rotation={[thetaCenter - Math.PI/2, phiCenter, 0, 'YXZ']}>
            {/* Invisible tracking marker for GSAP */}
            <Html position={[0, 0, radius]} center transform>
              <div 
                id={`globe-anchor-${index}`} 
                className="globe-anchor" 
                style={{ width: '75px', height: '50px', pointerEvents: 'none', opacity: 0 }} 
              />
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function Globe({ spinDirection }) {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002 * spinDirection.current;
    }
  });

  return (
    <group ref={globeRef} position={[0, 0, 0]}>
      {/* Solid inner core - this provides the "white" background for the gaps between images */}
      <mesh>
        <sphereGeometry args={[2.48, 64, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <Suspense fallback={null}>
        <ImageTiles />
        <ProjectAnchors />
      </Suspense>
    </group>
  );
}

export default function GlobeCanvas() {
  const spinDirection = useRef(1);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}
      onPointerDown={(e) => {
        isDragging.current = true;
        lastX.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (isDragging.current) {
          const delta = e.clientX - lastX.current;
          if (Math.abs(delta) > 0.5) {
            spinDirection.current = Math.sign(delta);
          }
          lastX.current = e.clientX;
        }
      }}
      onPointerUp={() => { isDragging.current = false; }}
      onPointerLeave={() => { isDragging.current = false; }}
    >
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1} />
        
        <Globe spinDirection={spinDirection} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} enableDamping={true} dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
