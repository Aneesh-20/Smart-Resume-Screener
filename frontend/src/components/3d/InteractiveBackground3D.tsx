import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const InteractiveBackground3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.z = 400;

      renderer = new THREE.WebGLRenderer({ alpha: true, powerPreference: 'low-power' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);

      const particleCount = 150;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 1200;
        positions[i + 1] = (Math.random() - 0.5) * 800;
        positions[i + 2] = (Math.random() - 0.5) * 600;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 2.2,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.08;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.08;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      const handleResize = () => {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        targetX += (mouseX - targetX) * 0.03;
        targetY += (mouseY - targetY) * 0.03;

        particles.rotation.y = elapsedTime * 0.03 + targetX * 0.002;
        particles.rotation.x = targetY * 0.002;

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
        geometry.dispose();
        material.dispose();
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
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
