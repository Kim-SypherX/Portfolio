// ========================================
// NEON SHADER
// Glow and bloom effects
// ========================================

const NeonShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            // Pulsing effect
            float pulse = sin(time * 2.0) * 0.2 + 0.8;
            
            // Edge glow
            float edgeGlow = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            
            // Combine
            vec3 finalColor = color * intensity * pulse;
            float finalIntensity = (1.0 + edgeGlow) * intensity;
            
            gl_FragColor = vec4(finalColor * finalIntensity, 1.0);
        }
    `,

    uniforms: {
        color: { value: new THREE.Color(0x00f0ff) },
        intensity: { value: 2.0 },
        time: { value: 0.0 }
    }
};

window.NeonShader = NeonShader;
