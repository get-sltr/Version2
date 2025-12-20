import { AvatarProgram } from "./AvatarProgram";
import { AvatarTextureLoader } from "./AvatarTextureLoader";
import { AvatarInstanceBuffer } from "./AvatarInstanceBuffer";
import { AvatarConfig } from "../config/avatarConfig";

export class WebGLAvatarRenderer {
  gl: WebGLRenderingContext;
  program: AvatarProgram;
  textures: AvatarTextureLoader;
  buffer: AvatarInstanceBuffer;

  constructor(gl: WebGLRenderingContext, vert: string, frag: string) {
    this.gl = gl;
    this.program = new AvatarProgram(gl, vert, frag);
    this.textures = new AvatarTextureLoader(gl);
    this.buffer = new AvatarInstanceBuffer(gl);
  }

  async draw(avatars: any[], matrix: Float32Array) {
    const gl = this.gl;

    gl.useProgram(this.program.program);

    const u_matrix = gl.getUniformLocation(this.program.program, "u_matrix");
    gl.uniformMatrix4fv(u_matrix, false, matrix);

    // Rim uniforms
    const rimColorRGB = typeof AvatarConfig.rimColor === 'string' 
      ? this.rgb(AvatarConfig.rimColor) 
      : new Float32Array(AvatarConfig.rimColor as any);
    gl.uniform3fv(gl.getUniformLocation(this.program.program, "u_rimColor"), rimColorRGB);
    gl.uniform3fv(gl.getUniformLocation(this.program.program, "u_borderColor"), this.rgb("#000000"));

    gl.uniform1f(gl.getUniformLocation(this.program.program, "u_rimThickness"), AvatarConfig.rimThickness);
    gl.uniform1f(gl.getUniformLocation(this.program.program, "u_avatarSize"), AvatarConfig.size);

    // Build instance buffer
    const instanceCount = this.buffer.build(avatars);

    // Bind attributes
    this.bindAttributes();

    // Draw instances
    gl.drawArrays(gl.POINTS, 0, instanceCount);
  }

  bindAttributes() {
    const gl = this.gl;
    const program = this.program.program;

    const stride = 8 * 4; // 8 floats = 32 bytes per instance
    const offset = (i: number) => i * 4;

    const attrib = (name: string, size: number, idx: number) => {
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset(idx));
    };

    this.buffer.bind();

    attrib("a_worldPos", 2, 0);
    attrib("a_offset", 2, 2);
    attrib("a_size", 1, 4);
    attrib("a_texCoord", 2, 5);
    attrib("a_pulseTime", 1, 7);
  }

  rgb(hex: string): Float32Array {
    const c = hex.replace("#", "");
    return new Float32Array([
      Number.parseInt(c.substring(0, 2), 16) / 255,
      Number.parseInt(c.substring(2, 4), 16) / 255,
      Number.parseInt(c.substring(4, 6), 16) / 255,
    ]);
  }
}
