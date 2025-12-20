export class AvatarTextureLoader {
  gl: WebGLRenderingContext;
  cache = new Map<string, WebGLTexture>();

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  async load(url: string): Promise<WebGLTexture> {
    const cached = this.cache.get(url);
    if (cached) return cached;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    await img.decode();

    const tex = this.gl.createTexture();
    if (!tex) {
      throw new Error('Unable to create WebGL texture');
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);

    this.cache.set(url, tex);
    return tex;
  }
}
