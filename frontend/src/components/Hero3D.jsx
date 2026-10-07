import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // 1. Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const motionHandler = (e) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // 2. Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const isSupported = !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!isSupported) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    if (!containerRef.current) return;

    // 3. Three.js Scene Setup
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap DPR to 1.5 for performance
    container.appendChild(renderer.domElement);

    // 4. Central Geometric Mesh (Forensic Face / Analysis Polyhedron)
    const geometry = new THREE.IcosahedronGeometry(1.6, 2);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6, // Teal
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const mesh = new THREE.Mesh(geometry, wireframeMat);
    scene.add(mesh);

    // Inner core glowing sphere
    const coreGeo = new THREE.IcosahedronGeometry(1.1, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 5. Orbiting Scanner Rings
    const ringGeo1 = new THREE.RingGeometry(2.1, 2.14, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(2.35, 2.38, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // 6. Point Cloud / Vertex Particles
    const particlesCount = 80;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 5.0;
      posArray[i + 1] = (Math.random() - 0.5) * 5.0;
      posArray[i + 2] = (Math.random() - 0.5) * 5.0;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x5eead4,
      transparent: true,
      opacity: 0.7
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 7. Interactive Parallax Mouse Movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 8. Lifecycle & Intersection Observer (Pause rendering when off-screen or tab hidden)
    let isVisible = true;
    let animId = null;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
      } else {
        isVisible = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 9. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible || reducedMotion) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth parallax damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      mesh.rotation.y += 0.006 + targetX * 0.01;
      mesh.rotation.x += 0.003 - targetY * 0.01;

      coreMesh.rotation.y -= 0.008;
      coreMesh.rotation.z += 0.004;

      ring1.rotation.z += 0.009;
      ring2.rotation.x += 0.007;

      // Pulsing effect
      const scale = 1.0 + Math.sin(time * 1.5) * 0.03;
      mesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // 10. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Cleanup
    return () => {
      if (animId) cancelAnimationFrame(animId);
      motionQuery.removeEventListener('change', motionHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      wireframeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  // WebGL Fallback or Reduced Motion Static View
  if (!webglSupported) {
    return (
      <div className="w-full h-80 sm:h-96 flex flex-col items-center justify-center p-6 bg-navy-950/40 rounded-3xl border border-teal-500/20 text-center">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-teal-400/60 animate-spin-slow flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-teal-500/40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-teal-500/30 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-xs font-mono text-teal-400 uppercase tracking-widest">
          Spatial Forensics Matrix
        </p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          (Static vector fallback rendered. 3D WebGL acceleration disabled on this device.)
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 sm:h-96 flex items-center justify-center select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing" />

      {/* Decorative Forensic HUD Overlays */}
      <div className="absolute top-2 left-4 pointer-events-none">
        <span className="text-[10px] font-mono text-teal-400/80 bg-navy-950/80 px-2 py-0.5 rounded border border-teal-500/30 uppercase tracking-wider">
          LIVE MESH SCANNER
        </span>
      </div>

      <div className="absolute bottom-2 right-4 pointer-events-none text-right">
        <span className="text-[9px] font-mono text-slate-400/80 bg-navy-950/80 px-2 py-0.5 rounded border border-slate-700/50">
          * Simulated Spatial Visualizer
        </span>
      </div>
    </div>
  );
}
