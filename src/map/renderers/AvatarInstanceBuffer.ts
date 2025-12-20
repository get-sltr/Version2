export type AvatarInstance = {
  worldPos: [number, number];
  offset: [number, number];
  size: number;
  texCoord: [number, number];
  pulse: number;
  image: string;
};

export class AvatarInstanceBuffer {
  gl: WebGLRenderingContext;
  buffer: WebGLBuffer | null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
  }

  bind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  }

  /** Build a combined Float32Array for all avatar attributes */
  build(avatars: AvatarInstance[]) {
    const data = [];

    for (const a of avatars) {
      // For each avatar instance:
      // [worldX, worldY, offsetX, offsetY, size, texU, texV, pulse]
      data.push(
        a.worldPos[0], a.worldPos[1],
        a.offset[0], a.offset[1],
        a.size,
        a.texCoord[0], a.texCoord[1],
        a.pulse
      );
    }

    const floatArray = new Float32Array(data);

    this.bind();
    this.gl.bufferData(this.gl.ARRAY_BUFFER, floatArray, this.gl.DYNAMIC_DRAW);

    return avatars.length;
  }
}
