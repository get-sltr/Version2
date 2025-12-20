import { WebGLAvatarRenderer } from "./WebGLAvatarRenderer";
import vert from "./shaders/avatar.vert";
import frag from "./shaders/avatar.frag";

export function createAvatarLayer(avatars: any[]) {
  let renderer: WebGLAvatarRenderer;

  return {
    id: "sltr-avatars",
    type: "custom",
    renderingMode: "3d",

    onAdd(map: any, gl: WebGLRenderingContext) {
      renderer = new WebGLAvatarRenderer(gl, vert, frag);
    },

    render(map: any, gl: WebGLRenderingContext) {
      const t = performance.now() / 1000;

      // Calculate pulse animation
      const animatedAvatars = avatars.map((a) => ({
        ...a,
        pulse: (Math.sin(t * 1.25 + a.id) + 1) * 0.5 // 0..1 cycle
      }));

      const matrix = map.transform.customLayerMatrix();
      renderer.draw(animatedAvatars, matrix);
      map.triggerRepaint();
    }
  };
}
