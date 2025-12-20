export class AvatarProgram {
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) {
    this.gl = gl;

    const vShader = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const fShader = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);

    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Program link error: " + gl.getProgramInfoLog(program));
    }

    this.program = program;
  }

  compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error("Shader compile error: " + this.gl.getShaderInfoLog(shader));
    }

    return shader;
  }
}
