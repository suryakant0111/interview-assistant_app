import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Color, Program, Mesh, Plane } from 'ogl';

export default function OGLBackground() {
  const canvasRef = useRef();
  const rendererRef = useRef();

  useEffect(() => {
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    canvasRef.current.appendChild(gl.canvas);

    // Responsive sizing
    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    resize();
    window.addEventListener('resize', resize);

    // Camera
    const camera = new Camera(gl, { fov: 16 });
    camera.position.z = 5;

    // Scene
    const scene = new Transform();

    // Plane geometry
    const geometry = new Plane(gl, { width: 2, height: 2 });
    // Premium gradient wave shader
    const program = new Program(gl, {
      vertex: `
        attribute vec2 uv;
        attribute vec3 position;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          float wave = 0.06 * sin(20.0 * vUv.x + uTime * 0.7) + 0.06 * cos(30.0 * vUv.y + uTime * 0.5);
          float y = vUv.y + wave;
          vec3 color1 = vec3(0.18, 0.22, 0.44); // deep blue
          vec3 color2 = vec3(0.56, 0.44, 0.98); // purple
          vec3 color3 = vec3(0.98, 0.44, 0.82); // pink
          vec3 color4 = vec3(0.98, 0.82, 0.44); // gold
          vec3 color = mix(color1, color2, y);
          color = mix(color, color3, 0.3 + 0.3 * sin(uTime * 0.2));
          color = mix(color, color4, 0.15 + 0.15 * cos(uTime * 0.13));
          gl_FragColor = vec4(color, 0.45); // more visible
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
    });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let animationId;
    let start = performance.now();
    function animate() {
      program.uniforms.uTime.value = (performance.now() - start) * 0.001;
      renderer.render({ scene, camera });
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      if (gl && gl.canvas && gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
      renderer && renderer.gl && renderer.gl.getExtension && renderer.gl.getExtension('WEBGL_lose_context') && renderer.gl.getExtension('WEBGL_lose_context').loseContext();
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        filter: 'blur(6px)', // glassy effect
      }}
      aria-hidden="true"
    />
  );
} 