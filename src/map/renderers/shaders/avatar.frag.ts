export default `precision highp float;

uniform sampler2D u_texture;

uniform vec3 u_rimColor;       // Primal orange
uniform vec3 u_borderColor;    // black
uniform float u_rimThickness;  // 2px
uniform float u_avatarSize;

varying vec2 v_texCoord;
varying float v_pulse;

void main() {
    vec2 uv = v_texCoord * 2.0 - 1.0;
    float dist = length(uv);

    // alpha mask circle
    if (dist > 1.0) discard;

    // base photo
    vec4 color = texture2D(u_texture, v_texCoord);

    // inner black precision border
    float border = smoothstep(0.98, 1.00, dist);
    if (border > 0.0) {
        gl_FragColor = vec4(u_borderColor, 1.0);
        return;
    }

    // outer rim (Primal orange)
    float rimEdge = 1.0 - (u_rimThickness / u_avatarSize);
    if (dist > rimEdge) {
        gl_FragColor = vec4(u_rimColor, 1.0);
        return;
    }

    gl_FragColor = color;
}`;
