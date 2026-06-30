'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Demo thumbnails to show on the globe (projects + other e-commerce/Shopify images)
const GLOBE_IMAGES = [
  // First 3 reserved for project slots
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', // Project 1
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80', // Project 2
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80', // Project 3
  
  // Diverse E-commerce / Shopify / Retail Images
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=90', // Dashboard/Analytics
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90', // Product (Shoes)
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=90', // Furniture
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=90', // POS system / Checkout
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=90', // Payment terminal
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&q=90', // Card payment
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=90', // Shopping bags
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=90', // Abstract cart / boxes
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=90', // Mobile app shopping
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=90', // Storefront
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90', // Watch product
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=90', // Headphones product
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=90', // Camera product
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=90', // Fashion apparel
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=90', // Skincare / Cosmetics
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=90', // Laptop desk / E-commerce team
  'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=800&q=90', // Shipping boxes / Logistics
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90', // Jewelry
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=90', // Plant shop / Small business
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=90', // Sunglasses
  'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=90', // Bags / Accessories
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=90', // Beauty products arrangement
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=90', // Minimalist Chair
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=90', // Retail aisle
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=90', // Retail clothing rack
  'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=90', // Sale shopping bags on floor
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=90', // Coding / Shopify Dev
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=90', // Coffee / Startup
  'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=90', // Online shopping on phone
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=90', // Packaging / Gift box
  'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800&q=90', // Clean minimal lifestyle product
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90', // High fashion clothing
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=90', // T-shirts rack
  'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&q=90', // Store display shelves
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=90', // Perfume bottle minimal
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=90', // Sneakers product shot
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=90', // Headphones on colored background
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=90'  // Laptop showing a website
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
          // Use a scattered deterministic pseudo-random texture from the rest
          const pseudoRandom = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
          const textureIndex = 3 + Math.floor(Math.abs(pseudoRandom - Math.floor(pseudoRandom)) * (textures.length - 3));
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
