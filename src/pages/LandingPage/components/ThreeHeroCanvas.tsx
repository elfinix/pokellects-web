import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeHeroCanvasProps {
  onBallClick?: () => void;
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({ onBallClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clickCallbackRef = useRef(onBallClick);

  useEffect(() => {
    clickCallbackRef.current = onBallClick;
  }, [onBallClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.2);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.0, 15);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // 4. Group for the 3D Pokéball
    const pokeGroup = new THREE.Group();
    scene.add(pokeGroup);

    const ballRadius = 2.0;

    // Top Hemisphere (Vibrant Crimson Red)
    const topGeo = new THREE.SphereGeometry(
      ballRadius,
      64,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5 - 0.05
    );
    const topMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      roughness: 0.18,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    pokeGroup.add(topMesh);

    // Bottom Hemisphere (Glossy Clean White)
    const botGeo = new THREE.SphereGeometry(
      ballRadius,
      64,
      32,
      0,
      Math.PI * 2,
      Math.PI * 0.5 + 0.05,
      Math.PI * 0.5 - 0.05
    );
    const botMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });
    const botMesh = new THREE.Mesh(botGeo, botMat);
    pokeGroup.add(botMesh);

    // Inner Core / Belt Cylinder (Dark Charcoal Slate)
    const beltGeo = new THREE.CylinderGeometry(
      ballRadius * 0.985,
      ballRadius * 0.985,
      0.22,
      64
    );
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
    });
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    pokeGroup.add(beltMesh);

    // Center Outer Button Rim
    const buttonRimGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.28, 32);
    buttonRimGeo.rotateX(Math.PI / 2);
    const buttonRimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.9,
    });
    const buttonRimMesh = new THREE.Mesh(buttonRimGeo, buttonRimMat);
    buttonRimMesh.position.set(0, 0, ballRadius * 0.96);
    pokeGroup.add(buttonRimMesh);

    // Center Inner Button (White with subtle emissive pulse)
    const buttonGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.32, 32);
    buttonGeo.rotateX(Math.PI / 2);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
    buttonMesh.position.set(0, 0, ballRadius * 0.97);
    pokeGroup.add(buttonMesh);

    // Surrounding Floating Particles Orbit Ring
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xf43f5e),
      new THREE.Color(0x3b82f6),
      new THREE.Color(0x10b981),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0x8b5cf6),
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.8 + Math.random() * 1.6;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 1.8;
      const z = Math.sin(angle) * radius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = palette[i % palette.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Initial slight angle
    pokeGroup.rotation.x = 0.25;
    pokeGroup.rotation.y = -0.35;

    // 5. Mouse Interaction & Click Impulse
    let targetRotationX = 0.25;
    let targetRotationY = -0.35;
    let scaleImpulse = 1.0;
    let jumpImpulse = 0.0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = normX * 0.8;
      targetRotationX = -normY * 0.6 + 0.2;
    };

    const handleClick = () => {
      // Trigger a springy squash & stretch physical pop
      scaleImpulse = 1.25;
      jumpImpulse = 0.45;
      buttonMat.emissiveIntensity = 1.0;

      if (clickCallbackRef.current) {
        clickCallbackRef.current();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Soft hovering floating motion + jump impulse
      pokeGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.12 + jumpImpulse;
      jumpImpulse *= 0.88;

      // Springy scale impulse recovery
      pokeGroup.scale.x += (scaleImpulse - pokeGroup.scale.x) * 0.15;
      pokeGroup.scale.y += ((1 / scaleImpulse) - pokeGroup.scale.y) * 0.15;
      pokeGroup.scale.z += (scaleImpulse - pokeGroup.scale.z) * 0.15;
      scaleImpulse += (1.0 - scaleImpulse) * 0.1;

      // Smooth damped rotation following cursor
      pokeGroup.rotation.y += (targetRotationY - pokeGroup.rotation.y) * 0.05;
      pokeGroup.rotation.x += (targetRotationX - pokeGroup.rotation.x) * 0.05;

      // Gentle auto idle rotation
      pokeGroup.rotation.y += 0.003;

      // Rotate particle constellation
      particleSystem.rotation.y = -elapsedTime * 0.15;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.4) * 0.1;

      // Pulse button light
      buttonMat.emissiveIntensity += ((0.25 + Math.sin(elapsedTime * 3) * 0.2) - buttonMat.emissiveIntensity) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[380px] sm:h-[440px] lg:h-[480px] relative flex items-center justify-center cursor-pointer select-none"
      title="Click the Pokéball to reveal a Pokémon!"
    />
  );
};

export default ThreeHeroCanvas;
