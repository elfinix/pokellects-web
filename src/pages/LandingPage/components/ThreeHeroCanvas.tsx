import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLenis } from 'lenis/react';

interface ThreeHeroCanvasProps {
  onBallClick?: () => void;
  onBallHoverChange?: (isHovered: boolean) => void;
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({
  onBallClick,
  onBallHoverChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clickCallbackRef = useRef(onBallClick);
  const hoverCallbackRef = useRef(onBallHoverChange);
  const scrollDataRef = useRef({ scroll: 0, velocity: 0 });

  // Sync scroll & velocity from Lenis
  useLenis((lenis) => {
    scrollDataRef.current.scroll = lenis.scroll;
    scrollDataRef.current.velocity = lenis.velocity;
  });

  useEffect(() => {
    clickCallbackRef.current = onBallClick;
  }, [onBallClick]);

  useEffect(() => {
    hoverCallbackRef.current = onBallHoverChange;
  }, [onBallHoverChange]);

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

    // 3. Lighting with rich Fresnel depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.4);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.2, 18);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // 4. Group for the 3D Pokéball
    const pokeGroup = new THREE.Group();
    scene.add(pokeGroup);

    const ballRadius = 2.0;

    // Top Hemisphere (Vibrant Crimson Red with deep clearcoat)
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
      roughness: 0.16,
      metalness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
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
      roughness: 0.14,
      metalness: 0.06,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
    });
    const botMesh = new THREE.Mesh(botGeo, botMat);
    pokeGroup.add(botMesh);

    // Inner Core / Belt Cylinder (Dark Slate Metallic)
    const beltGeo = new THREE.CylinderGeometry(
      ballRadius * 0.985,
      ballRadius * 0.985,
      0.22,
      64
    );
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.85,
    });
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    pokeGroup.add(beltMesh);

    // Center Outer Button Rim (Hollow Torus Ring - eliminates center Z-fighting)
    const buttonRimGeo = new THREE.TorusGeometry(0.44, 0.085, 24, 48);
    const buttonRimMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.25,
      metalness: 0.92,
    });
    const buttonRimMesh = new THREE.Mesh(buttonRimGeo, buttonRimMat);
    buttonRimMesh.position.set(0, 0, 1.96);
    pokeGroup.add(buttonRimMesh);

    // Center Inner Button (White with radiant pulse)
    const buttonGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 32);
    buttonGeo.rotateX(Math.PI / 2);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.45,
      roughness: 0.18,
    });
    const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
    buttonMesh.position.set(0, 0, 2.02);
    pokeGroup.add(buttonMesh);

    // Click Shockwave Ring Mesh
    const shockwaveGeo = new THREE.RingGeometry(0.4, 0.55, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(0, 0, 2.05);
    pokeGroup.add(shockwaveMesh);

    // Surrounding Floating Particles Orbit Ring
    const particleCount = 85;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xef4444),
      new THREE.Color(0x3b82f6),
      new THREE.Color(0x10b981),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xec4899),
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.7 + Math.random() * 1.8;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 2.0;
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
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Initial orientation
    pokeGroup.rotation.x = 0.25;
    pokeGroup.rotation.y = -0.35;

    // 5. Mouse Interaction & Impulse Dynamics
    const buttonBaseZ = 2.02;
    let buttonPressImpulse = 0.0;
    let buttonActivation = 0.0; // 0 = idle white, 1 = active opening red
    let buttonHoverActivation = 0.0; // 0 = not hovered, 1 = hovered

    const whiteColor = new THREE.Color(0xffffff);
    const activeRedColor = new THREE.Color(0xef4444);
    const idleEmissive = new THREE.Color(0x60a5fa);
    const activeEmissive = new THREE.Color(0xff1122);

    let targetRotationX = 0.25;
    let targetRotationY = -0.35;
    let scaleImpulse = 1.0;
    let jumpImpulse = 0.0;
    let shockwaveScale = 1.0;
    let shockwaveOpacity = 0.0;

    // Raycasting for interactive button hover detection & whole-ball hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let isMouseInside = false;
    let isButtonHovered = false;
    let isBallHoveredState = false;
    let hoverLeaveTimeout: number | null = null;
    const ballMeshes = [topMesh, botMesh, buttonMesh, buttonRimMesh, beltMesh];

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = normX * 0.8;
      targetRotationX = -normY * 0.55 + 0.2;

      // Track mouse inside container for raycasting
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        isMouseInside = true;
        mouse.x = normX;
        mouse.y = normY;
      } else {
        isMouseInside = false;
      }
    };

    const handleMouseLeave = () => {
      isMouseInside = false;
      isButtonHovered = false;
      if (hoverLeaveTimeout !== null) {
        clearTimeout(hoverLeaveTimeout);
        hoverLeaveTimeout = null;
      }
      if (isBallHoveredState) {
        isBallHoveredState = false;
        hoverCallbackRef.current?.(false);
      }
    };

    const handleClick = () => {
      // Trigger a springy squash & stretch physical pop + shockwave + red activation
      scaleImpulse = 1.28;
      jumpImpulse = 0.5;
      shockwaveScale = 0.8;
      shockwaveOpacity = 0.9;
      shockwaveMat.color.setHex(0xff3344);

      // Button depression & crimson opening illumination
      buttonPressImpulse = 0.08;
      buttonActivation = 1.0;

      if (clickCallbackRef.current) {
        clickCallbackRef.current();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    // 6. Animation Loop with Lenis Scroll Parallax Sync
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const { scroll, velocity } = scrollDataRef.current;

      // Raycast against center button to detect hover state
      let currentBallHover = false;
      if (isMouseInside) {
        raycaster.setFromCamera(mouse, camera);
        const ballIntersects = raycaster.intersectObjects(ballMeshes, false);
        currentBallHover = ballIntersects.length > 0;

        const buttonIntersects = raycaster.intersectObject(buttonMesh, false);
        isButtonHovered = buttonIntersects.length > 0;
      } else {
        currentBallHover = false;
        isButtonHovered = false;
      }

      // Smooth hover callback updates with debounced leave to prevent micro-flickers
      if (currentBallHover) {
        if (hoverLeaveTimeout !== null) {
          clearTimeout(hoverLeaveTimeout);
          hoverLeaveTimeout = null;
        }
        if (!isBallHoveredState) {
          isBallHoveredState = true;
          hoverCallbackRef.current?.(true);
        }
      } else if (isBallHoveredState && hoverLeaveTimeout === null) {
        hoverLeaveTimeout = window.setTimeout(() => {
          isBallHoveredState = false;
          hoverCallbackRef.current?.(false);
          hoverLeaveTimeout = null;
        }, 120);
      }

      // Smooth hover transition to red opening state
      const targetHover = isButtonHovered ? 1.0 : 0.0;
      buttonHoverActivation += (targetHover - buttonHoverActivation) * 0.12;

      // Lenis scroll velocity tilt & parallax
      const velocityTilt = Math.max(-0.35, Math.min(0.35, velocity * 0.005));
      const scrollRotationY = scroll * 0.001;

      // Soft hovering floating motion + jump impulse
      pokeGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.12 + jumpImpulse;
      jumpImpulse *= 0.88;

      // Springy scale impulse recovery
      pokeGroup.scale.x += (scaleImpulse - pokeGroup.scale.x) * 0.16;
      pokeGroup.scale.y += ((1 / scaleImpulse) - pokeGroup.scale.y) * 0.16;
      pokeGroup.scale.z += (scaleImpulse - pokeGroup.scale.z) * 0.16;
      scaleImpulse += (1.0 - scaleImpulse) * 0.1;

      // Smooth damped rotation following cursor + Lenis velocity tilt
      pokeGroup.rotation.y += (targetRotationY + scrollRotationY - pokeGroup.rotation.y) * 0.06;
      pokeGroup.rotation.x += (targetRotationX + velocityTilt - pokeGroup.rotation.x) * 0.06;

      // Gentle auto idle rotation
      pokeGroup.rotation.y += 0.0025;

      // Animate Shockwave ring
      if (shockwaveOpacity > 0.01) {
        shockwaveScale += 0.09;
        shockwaveOpacity *= 0.91;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, 1);
        shockwaveMat.opacity = shockwaveOpacity;
      } else {
        shockwaveMat.opacity = 0;
      }

      // Rotate particle constellation
      particleSystem.rotation.y = -elapsedTime * 0.16;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.35) * 0.08;

      // Button physical depression (spring back from click + subtle inward push on hover)
      buttonPressImpulse += (0 - buttonPressImpulse) * 0.14;
      buttonMesh.position.z = buttonBaseZ - buttonPressImpulse - buttonHoverActivation * 0.02;

      // Combined activation (hover + click)
      const totalActivation = Math.min(1.0, buttonActivation + buttonHoverActivation);

      // Smooth transition from white to red as if opening the ball
      buttonMat.color.lerpColors(whiteColor, activeRedColor, totalActivation);
      buttonMat.emissive.lerpColors(idleEmissive, activeEmissive, totalActivation);

      // Pulse button light with high intensity during red opening phase
      const idlePulse = 0.35 + Math.sin(elapsedTime * 2.8) * 0.22;
      buttonMat.emissiveIntensity = idlePulse * (1 - totalActivation) + totalActivation * 2.5;

      // Click activation decay
      buttonActivation += (0 - buttonActivation) * 0.045;

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
      if (hoverLeaveTimeout !== null) {
        clearTimeout(hoverLeaveTimeout);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
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
      className="w-full h-[380px] sm:h-[450px] lg:h-[490px] relative flex items-center justify-center cursor-pointer select-none"
      title="Click the Pokéball to reveal a Pokémon!"
    />
  );
};

export default ThreeHeroCanvas;
