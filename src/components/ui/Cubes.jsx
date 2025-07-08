import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

function CubeGrid({ gridSize, maxAngle, radius, faceColor, borderStyle, autoAnimate, rippleOnClick, rippleColor, rippleSpeed }) {
  const cubes = useMemo(() => {
    const arr = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        arr.push({ x, y });
      }
    }
    return arr;
  }, [gridSize]);

  // Animation state
  const timeRef = useRef(0);
  const [hovered, setHovered] = useState(null);
  const [clicked, setClicked] = useState(null);
  useFrame((state, delta) => {
    if (autoAnimate) {
      timeRef.current += delta * rippleSpeed;
    }
  });

  return (
    <group>
      {cubes.map(({ x, y }, i) => {
        // Calculate ripple effect
        const dx = x - gridSize / 2;
        const dy = y - gridSize / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = autoAnimate
          ? Math.sin(timeRef.current + dist / radius) * (maxAngle * Math.PI / 180)
          : 0;
        // Interactivity: color and scale
        const isHovered = hovered === i;
        const isClicked = clicked === i;
        const color = isHovered || isClicked ? rippleColor : faceColor;
        const scale = isClicked ? 1.3 : isHovered ? 1.1 : 1;
        return (
          <Box
            key={i}
            position={[dx * 1.2, dy * 1.2, 0]}
            args={[1, 1, 1]}
            rotation={[angle, angle, 0]}
            scale={scale}
            onPointerOver={() => setHovered(i)}
            onPointerOut={() => setHovered(null)}
            onClick={() => rippleOnClick && setClicked(i)}
            onPointerMissed={() => setClicked(null)}
          >
            <meshStandardMaterial
              attach="material"
              color={color}
              wireframe={false}
            />
          </Box>
        );
      })}
    </group>
  );
}

export default function Cubes({
  gridSize = 8,
  maxAngle = 60,
  radius = 4,
  borderStyle = '2px dashed #5227FF',
  faceColor = '#1a1a2e',
  rippleColor = '#ff6b6b',
  rippleSpeed = 1.5,
  autoAnimate = true,
  rippleOnClick = true,
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.25 }}>
      <Canvas camera={{ position: [0, 0, gridSize * 2] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={0.3} />
        <CubeGrid
          gridSize={gridSize}
          maxAngle={maxAngle}
          radius={radius}
          faceColor={faceColor}
          borderStyle={borderStyle}
          rippleColor={rippleColor}
          rippleSpeed={rippleSpeed}
          autoAnimate={autoAnimate}
          rippleOnClick={rippleOnClick}
        />
      </Canvas>
    </div>
  );
} 