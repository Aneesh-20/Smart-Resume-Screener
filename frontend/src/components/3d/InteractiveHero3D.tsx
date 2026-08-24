import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const InteractiveHero3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        (container.clientWidth || 300) / (container.clientHeight || 200),
        0.1,
        1000
      );
      camera.position.z = 24;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth || 300, container.clientHeight || 200);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const coreGroup = new THREE.Group();
      scene.add(coreGroup);

      // 1. Outer Wireframe Globe (Rose Gold)
      const sphereGeo = new THREE.IcosahedronGeometry(7, 2);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });
      const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
      coreGroup.add(wireMesh);

      // 2. Inner Glowing Torus Rings (Amber & Rose)
      const torusGeo = new THREE.TorusGeometry(8.5, 0.12, 16, 100);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.35,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.rotation.x = Math.PI / 3;
      coreGroup.add(torusMesh);

      const torusGeo2 = new THREE.TorusGeometry(6, 0.08, 16, 100);
      const torusMat2 = new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        transparent: true,
        opacity: 0.3,
      });
      const torusMesh2 = new THREE.Mesh(torusGeo2, torusMat2);
      torusMesh2.rotation.y = Math.PI / 4;
      coreGroup.add(torusMesh2);

      // 3. Floating Interactive Particles
      const particleCount = 200;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const colorA = new THREE.Color(0xf43f5e); // Rose
      const colorB = new THREE.Color(0xf59e0b); // Amber
      const colorC = new THREE.Color(0xfb923c); // Warm Peach

      for (let i = 0; i < particleCount; i++) {
        const radius = 5 + Math.random() * 5.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const mixedColor = i % 3 === 0 ? colorA : i % 3 === 1 ? colorB : colorC;
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      coreGroup.add(particles);

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        mouseX = (x / rect.width) * 2;
        mouseY = -(y / rect.height) * 2;
      };

      window.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        if (!container || !renderer) return;
        camera.aspect = (container.clientWidth || 300) / (container.clientHeight || 200);
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth || 300, container.clientHeight || 200);
      };

      window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        coreGroup.rotation.y = elapsedTime * 0.2 + targetX * 0.8;
        coreGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 + targetY * 0.5;

        torusMesh.rotation.z = elapsedTime * 0.3;
        torusMesh2.rotation.x = -elapsedTime * 0.25;

        const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.03;
        coreGroup.scale.set(scale, scale, scale);

        if (renderer) renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (container && renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        particleGeo.dispose();
        particleMat.dispose();
        sphereGeo.dispose();
        wireMat.dispose();
        torusGeo.dispose();
        torusMat.dispose();
        torusGeo2.dispose();
        torusMat2.dispose();
      };
    } catch {
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none opacity-85"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
