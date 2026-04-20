// Particle Life — emergence of life simulation
// WebGPU compute shaders + Catppuccin Mocha theme
// Physics: Jeffrey Ventrella-style attraction/repulsion with periodic boundary conditions

// ─── Simulation constants ────────────────────────────────────────────────────

const NUM_PARTICLES = 6000;
const NUM_TYPES = 7;
const RMAX = 85; // interaction radius (CSS px)
const RMIN = 14; // hard repulsion radius (CSS px)
const FRICTION = 0.87;
const BASE_FORCE = 11.0;
const DT = 1.0;
const PARTICLE_RADIUS = 3.5; // CSS px

// Matrix evolution: every EVOLVE_INTERVAL ms, begin a EVOLVE_DURATION ms lerp
const EVOLVE_INTERVAL = 22000;
const EVOLVE_DURATION = 9000;

// ─── Catppuccin Mocha accent palette ─────────────────────────────────────────

const TYPE_COLORS_HEX = [
  0xcba6f7, // Mauve
  0xf38ba8, // Red
  0xfab387, // Peach
  0xf9e2af, // Yellow
  0xa6e3a1, // Green
  0x89b4fa, // Blue
  0x94e2d5, // Teal
];

const BG_COLOR = { r: 0x11 / 255, g: 0x11 / 255, b: 0x1b / 255, a: 1.0 };

// ─── WGSL: compute shader (tiled N-body particle life) ───────────────────────

const COMPUTE_WGSL = /* wgsl */ `
struct Particle {
  px: f32, py: f32,
  vx: f32, vy: f32,
  ptype: f32,
  _p: f32,
}

struct Uniforms {
  width:       f32,
  height:      f32,
  count:       u32,
  num_types:   u32,
  dt:          f32,
  friction:    f32,
  rmin:        f32,
  rmax:        f32,
  force_scale: f32,
  _p0: f32, _p1: f32, _p2: f32,
}

@group(0) @binding(0) var<storage, read>       src : array<Particle>;
@group(0) @binding(1) var<storage, read_write> dst : array<Particle>;
@group(0) @binding(2) var<uniform>             u   : Uniforms;
@group(0) @binding(3) var<storage, read>       mat : array<f32>;

var<workgroup> tile: array<Particle, 256>;

// Particle Life force function (normalized r in [0,1], beta = rmin/rmax)
// Returns signed force magnitude: negative = repulsion, positive = attraction
fn force_val(r: f32, a: f32, beta: f32) -> f32 {
  if (r < beta) {
    return r / beta - 1.0;
  }
  let mid        = (beta + 1.0) * 0.5;
  let half_range = (1.0 - beta) * 0.5;
  return a * max(0.0, 1.0 - abs(r - mid) / half_range);
}

@compute @workgroup_size(256)
fn main(
  @builtin(global_invocation_id) gid : vec3<u32>,
  @builtin(local_invocation_id)  lid : vec3<u32>,
) {
  let i       = gid.x;
  let count   = u.count;
  let valid   = i < count;
  let beta    = u.rmin / u.rmax;
  let rmax2   = u.rmax * u.rmax;
  let half_w  = u.width  * 0.5;
  let half_h  = u.height * 0.5;

  var p: Particle;
  if (valid) { p = src[i]; }

  var fx = 0.0f;
  var fy = 0.0f;
  let pt = u32(p.ptype);

  let num_tiles = (count + 255u) / 256u;

  for (var t = 0u; t < num_tiles; t++) {
    // All threads cooperatively load one tile of 256 particles
    let j = t * 256u + lid.x;
    if (j < count) { tile[lid.x] = src[j]; }
    workgroupBarrier();

    if (valid) {
      let tile_sz = min(256u, count - t * 256u);
      for (var k = 0u; k < tile_sz; k++) {
        let j_g = t * 256u + k;
        if (j_g == i) { continue; }

        let q  = tile[k];
        var dx = q.px - p.px;
        var dy = q.py - p.py;

        // Periodic (toroidal) boundary
        if      (dx >  half_w) { dx -= u.width;  }
        else if (dx < -half_w) { dx += u.width;  }
        if      (dy >  half_h) { dy -= u.height; }
        else if (dy < -half_h) { dy += u.height; }

        let dist2 = dx * dx + dy * dy;
        if (dist2 >= rmax2 || dist2 < 0.01f) { continue; }

        let dist = sqrt(dist2);
        let r    = dist / u.rmax;

        let qt = u32(q.ptype);
        let a  = mat[pt * u.num_types + qt];
        let f  = force_val(r, a, beta) * u.force_scale / dist;

        fx += dx * f;
        fy += dy * f;
      }
    }
    workgroupBarrier();
  }

  if (!valid) { return; }

  var vx = p.vx * u.friction + fx * u.dt;
  var vy = p.vy * u.friction + fy * u.dt;

  // Speed cap to prevent particles from tunnelling across the screen
  let speed2    = vx * vx + vy * vy;
  let max_speed = u.rmax * 0.28f;
  if (speed2 > max_speed * max_speed) {
    let inv = max_speed / sqrt(speed2);
    vx *= inv;
    vy *= inv;
  }

  var px = p.px + vx * u.dt;
  var py = p.py + vy * u.dt;

  if      (px < 0.0f)    { px += u.width;  }
  else if (px >= u.width) { px -= u.width;  }
  if      (py < 0.0f)    { py += u.height; }
  else if (py >= u.height){ py -= u.height; }

  dst[i] = Particle(px, py, vx, vy, p.ptype, 0.0);
}
`;

// ─── WGSL: render shader (instanced quads → glowing circles) ─────────────────

const RENDER_WGSL = /* wgsl */ `
struct Particle {
  px: f32, py: f32,
  vx: f32, vy: f32,
  ptype: f32,
  _p: f32,
}

struct RenderUniforms {
  width:  f32,
  height: f32,
  radius: f32,
  time:   f32,
}

struct VertOut {
  @builtin(position) pos:   vec4<f32>,
  @location(0)       color: vec3<f32>,
  @location(1)       uv:    vec2<f32>,
  @location(2)       speed: f32,
}

@group(0) @binding(0) var<storage, read> particles : array<Particle>;
@group(0) @binding(1) var<uniform>       u         : RenderUniforms;
@group(0) @binding(2) var<storage, read> colors    : array<vec4<f32>>;

@vertex
fn vs_main(
  @builtin(vertex_index)   vi : u32,
  @builtin(instance_index) ii : u32,
) -> VertOut {
  let p = particles[ii];

  // Two-triangle quad
  let quad = array<vec2<f32>, 6>(
    vec2(-1.0, -1.0), vec2( 1.0, -1.0), vec2(-1.0,  1.0),
    vec2( 1.0, -1.0), vec2( 1.0,  1.0), vec2(-1.0,  1.0),
  );
  let uv = quad[vi];

  let ndc_x =        (p.px + uv.x * u.radius) / u.width  * 2.0 - 1.0;
  let ndc_y = 1.0 - ((p.py + uv.y * u.radius) / u.height * 2.0);

  let spd = length(vec2(p.vx, p.vy));

  var out: VertOut;
  out.pos   = vec4(ndc_x, ndc_y, 0.0, 1.0);
  out.color = colors[u32(p.ptype)].rgb;
  out.uv    = uv;
  out.speed = clamp(spd / 9.0, 0.0, 1.0);
  return out;
}

@fragment
fn fs_main(in: VertOut) -> @location(0) vec4<f32> {
  let d = length(in.uv);
  if (d > 1.0) { discard; }

  // Bright solid core + soft glow halo
  let core = 1.0 - smoothstep(0.0,  0.30, d);
  let halo = 1.0 - smoothstep(0.15, 1.0,  d);

  // Fast particles burn brighter
  let brightness = core * 2.8 + halo * 0.55 + in.speed * core * 1.4;
  let alpha      = halo * 0.88;

  return vec4(in.color * brightness, alpha);
}
`;

// ─── Matrix helpers ──────────────────────────────────────────────────────────

function randomMatrix(types: number): Float32Array {
  const m = new Float32Array(types * types);
  for (let i = 0; i < m.length; i++) {
    // Bias slightly toward attraction to encourage clustering
    m[i] = Math.random() * 2 - 0.9;
  }
  return m;
}

function lerpMatrix(a: Float32Array, b: Float32Array, t: number): Float32Array {
  const out = new Float32Array(a.length);
  const s = t * t * (3 - 2 * t); // smoothstep
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] + (b[i] - a[i]) * s;
  }
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const noSupport = document.getElementById("no-webgpu") as HTMLDivElement;

  if (!navigator.gpu) {
    noSupport.style.display = "flex";
    return;
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) {
    noSupport.style.display = "flex";
    return;
  }

  const device = await adapter.requestDevice();
  const ctx = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();

  // ── Canvas sizing (CSS logical pixel coordinate space) ───────────────────
  let cssW = 0,
    cssH = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas(): void {
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  ctx.configure({ device, format, alphaMode: "opaque" });

  // ── Particle buffer (ping-pong) ───────────────────────────────────────────
  // Layout per particle: [px, py, vx, vy, ptype, _pad] = 6 × f32 = 24 bytes
  const STRIDE = 6;
  const initData = new Float32Array(NUM_PARTICLES * STRIDE);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const o = i * STRIDE;
    initData[o + 0] = Math.random() * cssW;
    initData[o + 1] = Math.random() * cssH;
    initData[o + 2] = 0;
    initData[o + 3] = 0;
    initData[o + 4] = Math.floor(Math.random() * NUM_TYPES);
    initData[o + 5] = 0;
  }

  const BUF_SIZE = initData.byteLength;
  const pBufs = [
    device.createBuffer({
      size: BUF_SIZE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
    device.createBuffer({
      size: BUF_SIZE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
  ];
  device.queue.writeBuffer(pBufs[0], 0, initData);

  // ── Compute uniform buffer (48 bytes, 12 × f32/u32) ──────────────────────
  const computeUBuf = device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── Attraction matrix buffer ──────────────────────────────────────────────
  let matCurrent = randomMatrix(NUM_TYPES);
  let matTarget = randomMatrix(NUM_TYPES);
  let matT = 1.0;
  let lastEvolve = performance.now();

  const matBuf = device.createBuffer({
    size: NUM_TYPES * NUM_TYPES * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(matBuf, 0, matCurrent);

  // ── Color buffer (7 × vec4<f32>) ─────────────────────────────────────────
  const colorData = new Float32Array(NUM_TYPES * 4);
  TYPE_COLORS_HEX.forEach((hex, i) => {
    colorData[i * 4 + 0] = ((hex >> 16) & 0xff) / 255;
    colorData[i * 4 + 1] = ((hex >> 8) & 0xff) / 255;
    colorData[i * 4 + 2] = (hex & 0xff) / 255;
    colorData[i * 4 + 3] = 1.0;
  });
  const colorBuf = device.createBuffer({
    size: colorData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(colorBuf, 0, colorData);

  // ── Render uniform buffer (16 bytes, 4 × f32) ────────────────────────────
  const renderUBuf = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // ── Pipelines ─────────────────────────────────────────────────────────────
  const computeModule = device.createShaderModule({ code: COMPUTE_WGSL });
  const renderModule = device.createShaderModule({ code: RENDER_WGSL });

  const [computePipeline, renderPipeline] = await Promise.all([
    device.createComputePipelineAsync({
      layout: "auto",
      compute: { module: computeModule, entryPoint: "main" },
    }),
    device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module: renderModule, entryPoint: "vs_main" },
      fragment: {
        module: renderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format,
            blend: {
              // Additive blending: dense particle clusters glow brighter
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one",
                operation: "add",
              },
              alpha: { srcFactor: "one", dstFactor: "one", operation: "add" },
            },
          },
        ],
      },
      primitive: { topology: "triangle-list" },
    }),
  ]);

  // ── Bind groups (two sets for ping-pong) ──────────────────────────────────
  const computeBGs = [0, 1].map((i) =>
    device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: pBufs[i] } }, // src
        { binding: 1, resource: { buffer: pBufs[1 - i] } }, // dst
        { binding: 2, resource: { buffer: computeUBuf } },
        { binding: 3, resource: { buffer: matBuf } },
      ],
    }),
  );

  const renderBGs = [0, 1].map((i) =>
    device.createBindGroup({
      layout: renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: pBufs[i] } },
        { binding: 1, resource: { buffer: renderUBuf } },
        { binding: 2, resource: { buffer: colorBuf } },
      ],
    }),
  );

  // ── Frame loop ────────────────────────────────────────────────────────────
  let ping = 0;
  let lastTime = performance.now();
  const WG = Math.ceil(NUM_PARTICLES / 256);

  // Shared ArrayBuffer for compute uniforms (avoids repeated allocation)
  const computeUniformAB = new ArrayBuffer(48);
  const computeUniformF32 = new Float32Array(computeUniformAB);
  const computeUniformU32 = new Uint32Array(computeUniformAB);

  function frame(): void {
    const now = performance.now();
    const elapsed = now - lastTime;
    lastTime = now;

    // ── Matrix evolution (slow lerp to new random target) ──────────────────
    const evolveAge = now - lastEvolve;
    if (evolveAge > EVOLVE_INTERVAL && matT >= 1.0) {
      matCurrent = lerpMatrix(matCurrent, matTarget, 1.0);
      matTarget = randomMatrix(NUM_TYPES);
      matT = 0.0;
      lastEvolve = now;
    }
    if (matT < 1.0) {
      matT = Math.min(1.0, matT + elapsed / EVOLVE_DURATION);
      device.queue.writeBuffer(
        matBuf,
        0,
        lerpMatrix(matCurrent, matTarget, matT),
      );
    }

    // ── "Breathing" force — subtle oscillation to feel alive ───────────────
    const t = now * 0.001;
    const forceScale = BASE_FORCE * (0.82 + 0.18 * Math.sin(t * 0.25));

    // ── Update compute uniforms ─────────────────────────────────────────────
    computeUniformF32[0] = cssW;
    computeUniformF32[1] = cssH;
    computeUniformU32[2] = NUM_PARTICLES;
    computeUniformU32[3] = NUM_TYPES;
    computeUniformF32[4] = DT;
    computeUniformF32[5] = FRICTION;
    computeUniformF32[6] = RMIN;
    computeUniformF32[7] = RMAX;
    computeUniformF32[8] = forceScale;
    device.queue.writeBuffer(computeUBuf, 0, computeUniformAB);

    // ── Update render uniforms ──────────────────────────────────────────────
    device.queue.writeBuffer(
      renderUBuf,
      0,
      new Float32Array([cssW, cssH, PARTICLE_RADIUS, t]),
    );

    const encoder = device.createCommandEncoder();

    // Compute pass: physics step
    const cPass = encoder.beginComputePass();
    cPass.setPipeline(computePipeline);
    cPass.setBindGroup(0, computeBGs[ping]);
    cPass.dispatchWorkgroups(WG);
    cPass.end();

    // Render pass: draw particles from output buffer
    const rPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: ctx.getCurrentTexture().createView(),
          clearValue: BG_COLOR,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    rPass.setPipeline(renderPipeline);
    rPass.setBindGroup(0, renderBGs[1 - ping]); // render the dst (freshly computed) buffer
    rPass.draw(6, NUM_PARTICLES);
    rPass.end();

    device.queue.submit([encoder.finish()]);
    ping = 1 - ping;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

main().catch((err) => {
  console.error("Particle Life init failed:", err);
  const el = document.getElementById("no-webgpu");
  if (el) el.style.display = "flex";
});
