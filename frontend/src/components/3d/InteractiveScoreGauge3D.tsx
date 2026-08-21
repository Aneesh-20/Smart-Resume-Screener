import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface InteractiveScoreGauge3DProps {
  score: number; // 1.0 to 10.0
  size?: number;
}

export const InteractiveScoreGauge3D: React.FC<InteractiveScoreGauge3DProps> = ({
  score,
  size = 110,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 7;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      let hexColor = 0x10b981; // Emerald
      if (score < 5.0) hexColor = 0xf43f5e; // Rose
      else if (score < 7.0) hexColor = 0xf59e0b; // Amber

      const group = new THREE.Group();
      scene.add(group);

      const normalizedArc = Math.max(0.2, Math.min(1.0, score / 10.0)) * Math.PI * 2;
      const torusGeo = new THREE.TorusGeometry(2.2, 0.22, 16, 60, normalizedArc);
      const torusMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.85,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      group.add(torusMesh);

      const trackGeo = new THREE.TorusGeometry(2.2, 0.08, 16, 60);
      const trackMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.3,
      });
      const trackMesh = new THREE.Mesh(trackGeo, trackMat);
      group.add(trackMesh);

      const dotGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      group.add(dotMesh);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        group.rotation.x = Math.PI / 6 + Math.sin(elapsedTime * 1.5) * 0.15;
        group.rotation.y = elapsedTime * 0.8;

        const angle = elapsedTime * 2;
        dotMesh.position.x = Math.cos(angle) * 2.2;
        dotMesh.position.y = Math.sin(angle) * 2.2;

        if (renderer) renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (container && renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        torusGeo.dispose();
        torusMat.dispose();
        trackGeo.dispose();
        trackMat.dispose();
        dotGeo.dispose();
        dotMat.dispose();
      };
    } catch {
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [score, size]);

  return (
    <div
      ref={mountRef}
      className="inline-flex items-center justify-center pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
};
