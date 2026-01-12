// ========================================
// HOLOGRAM SHADER
// Fresnel glow and holographic effects
// ========================================

const HologramShader = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
            // Fresnel effect
            vec3 viewDirection = normalize(vPosition);
            float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
            
            // Scan lines
            float scanline = sin(vUv.y * 100.0 + time * 2.0) * 0.5 + 0.5;
            scanline = smoothstep(0.3, 0.7, scanline);
            
            // Hologram flicker
            float flicker = sin(time * 10.0) * 0.1 + 0.9;
            
            // Combine effects
            vec3 finalColor = color * fresnel * scanline * flicker;
            float finalOpacity = opacity * fresnel;
            
            gl_FragColor = vec4(finalColor, finalOpacity);
        }
    `,

    uniforms: {
        time: { value: 0.0 },
        color: { value: new THREE.Color(0x00f0ff) },
        opacity: { value: 0.8 }
    }
};

window.HologramShader = HologramShader;
