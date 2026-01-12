// ========================================
// GLITCH SHADER
// RGB split and digital noise effects
// ========================================

const GlitchShader = {
    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        
        // Random function
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // RGB split
            float splitAmount = intensity * 0.01;
            vec4 r = texture2D(tDiffuse, uv + vec2(splitAmount, 0.0));
            vec4 g = texture2D(tDiffuse, uv);
            vec4 b = texture2D(tDiffuse, uv - vec2(splitAmount, 0.0));
            
            // Combine channels
            vec4 color = vec4(r.r, g.g, b.b, 1.0);
            
            // Scan lines
            float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04;
            color.rgb -= scanline;
            
            // Digital noise
            float noise = random(uv + time) * 0.05 * intensity;
            color.rgb += noise;
            
            // Glitch blocks
            if (random(vec2(floor(uv.y * 20.0), time)) > 0.95) {
                color.rgb = vec3(random(uv + time));
            }
            
            gl_FragColor = color;
        }
    `,

    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        intensity: { value: 1.0 }
    }
};

window.GlitchShader = GlitchShader;
