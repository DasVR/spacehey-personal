/*
 * Dithered flow field. One full-screen triangle, one fragment shader.
 *
 * The canvas renders at 1/cell of the CSS size and is upscaled with
 * `image-rendering: pixelated`, so every Bayer cell is a crisp square and a
 * phone only shades a few thousand pixels per frame.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerAmt;
uniform float uTap;
uniform float uGain;
uniform float uScroll;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * snoise(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
#define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
#define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  p.y += uScroll * 0.12;
  float t = uTime;

  // Two passes of domain warping: smoke that folds over itself.
  vec2 q = vec2(fbm(p * 1.2 + vec2(0.0, t * 0.05)), fbm(p * 1.2 + vec2(5.2, 1.3) - t * 0.04));
  vec2 r = vec2(
    fbm(p * 1.6 + 2.2 * q + vec2(1.7, 9.2) + t * 0.03),
    fbm(p * 1.6 + 2.2 * q + vec2(8.3, 2.8) - t * 0.025)
  );
  float v = fbm(p * 1.3 + 2.0 * r) * 0.5 + 0.5;

  // A horizon of light near the top that sways, falling off toward the content.
  float horizon = exp(-pow((p.y - 0.58 + 0.07 * sin(p.x * 1.3 + t * 0.1)) * 2.1, 2.0));
  float body = smoothstep(-0.75, 0.6, p.y);
  float light = v * (0.3 + 0.7 * horizon) * mix(0.3, 1.0, body);
  light = pow(light, 1.35) * 1.7 * uGain;
  // Past the card the smoke settles so text can sit on it.
  light *= mix(1.0, 0.3, smoothstep(0.15, 0.9, uScroll));

  // Pointer: a soft lamp that lifts the smoke under it.
  vec2 pp = vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5);
  vec2 dp = p - pp;
  light += uPointerAmt * 0.4 * exp(-dot(dp, dp) * 8.0) * (0.5 + 0.5 * v);

  // Tap: a luminous wave rolls down from the top edge, where the phones touched.
  if (uTap >= 0.0) {
    float fade = exp(-uTap * 0.75);
    float head = 0.62 - uTap * 1.15;
    float edge = p.y - head + 0.07 * fbm(vec2(p.x * 2.2, uTap * 0.6));
    float front = exp(-pow(edge * 8.0, 2.0));
    float wake = smoothstep(0.0, 0.35, edge) * exp(-edge * 2.2);
    float d = length(p - vec2(0.0, 0.56));
    float ring = exp(-pow((d - uTap * 0.95) * 11.0, 2.0));
    light += (front * 1.25 + wake * 0.45 * v + ring * 0.45) * fade;
  }

  float b = bayer8(frag);
  float lvl = floor(clamp(light, 0.0, 1.0) * 3.0 + b);
  vec3 col = uC0;
  col = mix(col, uC1, step(1.0, lvl));
  col = mix(col, uC2, step(2.0, lvl));
  col = mix(col, uC3, step(3.0, lvl));
  gl_FragColor = vec4(col, 1.0);
}
`;

export type Rgb = [number, number, number];

export interface FieldPalette {
  c0: Rgb;
  c1: Rgb;
  c2: Rgb;
  c3: Rgb;
  speed: number;
  gain: number;
  cell: number;
}

export interface FieldOptions {
  /** Frames per second ceiling. The field is slow; 30 is plenty. */
  fps: number;
  /** Render one frame and stop (prefers-reduced-motion). */
  still: boolean;
}

type UniformName =
  | 'uRes'
  | 'uTime'
  | 'uPointer'
  | 'uPointerAmt'
  | 'uTap'
  | 'uGain'
  | 'uScroll'
  | 'uC0'
  | 'uC1'
  | 'uC2'
  | 'uC3';

const UNIFORMS: UniformName[] = ['uRes', 'uTime', 'uPointer', 'uPointerAmt', 'uTap', 'uGain', 'uScroll', 'uC0', 'uC1', 'uC2', 'uC3'];

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[field] shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

export class DitherField {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private loc = {} as Record<UniformName, WebGLUniformLocation | null>;
  private raf = 0;
  private last = 0;
  private clock = 0;
  private tapStart = -1;
  private pointer = { x: 0.62, y: 0.78, tx: 0.62, ty: 0.78, amt: 0, tamt: 0 };
  private scroll = 0;
  private running = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private palette: FieldPalette,
    private options: FieldOptions,
  ) {
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });
    if (!gl) throw new Error('webgl unavailable');
    this.gl = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) throw new Error('shader compile failed');
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('shader link failed');
    this.program = program;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    for (const name of UNIFORMS) this.loc[name] = gl.getUniformLocation(program, name);
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const cell = Math.max(1, this.palette.cell);
    const w = Math.max(1, Math.ceil(rect.width / cell));
    const h = Math.max(1, Math.ceil(rect.height / cell));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
    if (!this.running) this.draw();
  }

  setPalette(palette: FieldPalette): void {
    const cellChanged = palette.cell !== this.palette.cell;
    this.palette = palette;
    if (cellChanged) this.resize();
    else if (!this.running) this.draw();
  }

  /** Pointer in viewport-relative 0–1, y down (DOM convention). */
  setPointer(x: number, y: number, active: boolean): void {
    this.pointer.tx = x;
    this.pointer.ty = 1 - y;
    this.pointer.tamt = active ? 1 : 0;
  }

  /** Scroll in viewport heights. */
  setScroll(screens: number): void {
    this.scroll = Math.min(2, Math.max(0, screens));
    if (!this.running) this.draw();
  }

  tap(): void {
    this.tapStart = this.clock;
    if (!this.running && this.options.still) this.runFor(3.5);
  }

  start(): void {
    if (this.options.still) {
      this.draw();
      return;
    }
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy(): void {
    this.stop();
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  /** Reduced motion still gets the tap wave, then settles back to a still. */
  private runFor(seconds: number): void {
    this.running = true;
    this.last = performance.now();
    const until = this.clock + seconds;
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.clock += dt;
      this.draw();
      if (this.clock < until && this.running) this.raf = requestAnimationFrame(step);
      else this.running = false;
    };
    this.raf = requestAnimationFrame(step);
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const minDelta = 1000 / this.options.fps;
    const elapsed = now - this.last;
    if (elapsed < minDelta - 1) return;
    const dt = Math.min(0.1, elapsed / 1000);
    this.last = now;
    this.clock += dt;

    const k = 1 - Math.exp(-dt * 4);
    this.pointer.x = lerp(this.pointer.x, this.pointer.tx, k);
    this.pointer.y = lerp(this.pointer.y, this.pointer.ty, k);
    this.pointer.amt = lerp(this.pointer.amt, this.pointer.tamt, 1 - Math.exp(-dt * 2));
    this.draw();
  };

  private draw(): void {
    const { gl, loc, palette } = this;
    const tap = this.tapStart < 0 ? -1 : this.clock - this.tapStart;
    gl.uniform2f(loc.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(loc.uTime, this.clock * palette.speed + 40);
    gl.uniform2f(loc.uPointer, this.pointer.x, this.pointer.y);
    gl.uniform1f(loc.uPointerAmt, this.pointer.amt);
    gl.uniform1f(loc.uTap, tap > 6 ? -1 : tap);
    gl.uniform1f(loc.uGain, palette.gain);
    gl.uniform1f(loc.uScroll, this.scroll);
    gl.uniform3fv(loc.uC0, palette.c0);
    gl.uniform3fv(loc.uC1, palette.c1);
    gl.uniform3fv(loc.uC2, palette.c2);
    gl.uniform3fv(loc.uC3, palette.c3);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
