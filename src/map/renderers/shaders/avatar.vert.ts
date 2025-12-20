export default `precision highp float;

attribute vec2 a_position;      // -1..1 quad
attribute vec2 a_offset;        // pixel offset
attribute float a_size;         // avatar size
attribute vec2 a_texCoord;      // texture UV
attribute vec2 a_worldPos;      // lng/lat projected
attribute float a_pulseTime;    // 0..1 pulse phase

uniform mat4 u_matrix;          // mapbox projection

varying vec2 v_texCoord;
varying float v_pulse;

void main() {
    // Position quad in screen space using mapbox projection
    vec4 worldPos = u_matrix * vec4(a_worldPos, 0.0, 1.0);

    // Apply pixel offset for size
    worldPos.xy += a_offset * a_size;

    gl_Position = worldPos;

    v_texCoord = a_texCoord;
    v_pulse = a_pulseTime;
}`;
