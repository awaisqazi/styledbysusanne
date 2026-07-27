/**
 * The Rail: a WebGL gallery view for the lookbook.
 *
 * Looks hang on a gentle arc, like garments on a rail, and you drag through
 * them. The centre look is the active one; releasing snaps to the nearest.
 * Everything here is an enhancement layered over the grid, which stays in
 * the DOM and remains the default: this module is imported only when the
 * visitor switches to Gallery, so nobody pays for three.js otherwise.
 */
import * as THREE from 'three';

export interface GalleryLook {
  id: string;
  src: string;
  title: string;
  category: string;
  shoppable: boolean;
}

interface GalleryOptions {
  canvas: HTMLCanvasElement;
  looks: GalleryLook[];
  /** Called whenever the centred look changes. */
  onActiveChange?: (look: GalleryLook, index: number) => void;
  /** Called when the centred look is chosen (click or Enter). */
  onSelect?: (look: GalleryLook, index: number) => void;
  /** Fired once the looks around centre have their textures. */
  onReady?: () => void;
  /** A deliberate vertical swipe on the stage (used by the detail sheet). */
  onVerticalSwipe?: (direction: 'up' | 'down') => void;
}

export interface GalleryHandle {
  goTo(index: number, immediate?: boolean): void;
  step(delta: number): void;
  activeIndex(): number;
  resize(): void;
  setPaused(paused: boolean): void;
  destroy(): void;
}

/** Cover-fit a square texture onto a 4:5 card, with rounded corners. */
const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uDim;
  uniform float uOpacity;
  uniform float uRadius;
  uniform vec2 uSize;
  uniform vec3 uPlaceholder;
  uniform vec3 uTint;

  // Signed distance to a rounded rectangle.
  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    // Cover crop: the source frames are square, the cards are 4:5.
    vec2 uv = vUv;
    float scale = uSize.x / uSize.y;
    uv.x = (uv.x - 0.5) * scale + 0.5;

    vec3 colour = uPlaceholder;
    if (uHasMap > 0.5) {
      colour = texture2D(uMap, uv).rgb;
    }

    // Looks away from centre recede into the warm background.
    colour = mix(colour, uTint, uDim);

    vec2 p = (vUv - 0.5) * uSize;
    float d = roundedBox(p, uSize * 0.5, uRadius);
    // Feather across roughly one pixel. d is in world units, so the band has
    // to be derived from the on-screen gradient: a fixed span here would
    // fade the whole card, not just its edge.
    float aa = max(fwidth(d), 0.0015);
    float edge = 1.0 - smoothstep(-aa, aa, d);
    if (edge <= 0.001) discard;

    gl_FragColor = vec4(colour, edge * uOpacity);

    // Textures are flagged sRGB, so the GPU hands this shader linear values
    // and the tint mixes in linear too. Without this encode the rail renders
    // noticeably darker than the photos it is showing.
    #include <colorspace_fragment>
  }
`;

const CARD_WIDTH = 2.08;
const CARD_HEIGHT = 2.6;
/** Radians between neighbours on the arc. */
const ANGLE_STEP = 0.44;
const ARC_RADIUS = 6;
/** Textures are only fetched for looks within this many places of centre. */
const LOAD_WINDOW = 4;
/** Reveal the canvas once this many of the first looks have arrived. */
const READY_COUNT = 3;

export function createLookGallery({
  canvas,
  looks,
  onActiveChange,
  onSelect,
  onReady,
  onVerticalSwipe,
}: GalleryOptions): GalleryHandle {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    // Keeps the rail visible in screenshots and screen recordings, which is
    // how this view mostly gets shared.
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, 1, 1);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  const placeholder = new THREE.Color('#efe7dc');
  const tint = new THREE.Color('#f7efe6');

  interface Card {
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    texture?: THREE.Texture;
    requested: boolean;
  }

  const cards: Card[] = looks.map((_, index) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      // Alpha-blended cards: order them with renderOrder, not the depth
      // buffer, so overlapping neighbours never punch holes in each other.
      depthWrite: false,
      uniforms: {
        uMap: { value: null },
        uHasMap: { value: 0 },
        uDim: { value: 0 },
        uOpacity: { value: 1 },
        uRadius: { value: 0.12 },
        uSize: { value: new THREE.Vector2(CARD_WIDTH, CARD_HEIGHT) },
        uPlaceholder: { value: placeholder },
        uTint: { value: tint },
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = index;
    mesh.userData.index = index;
    scene.add(mesh);
    return { mesh, material, requested: false };
  });

  /** Fractional position along the rail; whole numbers centre a look. */
  let offset = 0;
  let target = 0;
  let velocity = 0;
  let dragging = false;
  let pointerId: number | null = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragAxis: 'x' | 'y' | null = null;
  let dragDy = 0;
  let dragStartOffset = 0;
  let moved = 0;
  let paused = false;
  let disposed = false;
  let lastActive = -1;

  const count = looks.length;

  /**
   * The rail is a loop: looks always hang on both sides of centre, so the
   * stage never empties out at the ends and dragging never dead-ends.
   */
  const wrapIndex = (value: number) => ((value % count) + count) % count;
  const signedDelta = (index: number, from: number) => {
    let delta = (index - from) % count;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    return delta;
  };

  let loadedCount = 0;
  let announcedReady = false;
  const noteLoaded = () => {
    loadedCount++;
    if (!announcedReady && loadedCount >= Math.min(READY_COUNT, looks.length)) {
      announcedReady = true;
      onReady?.();
    }
  };

  const ensureTexture = (index: number) => {
    const card = cards[index];
    if (!card || card.requested) return;
    card.requested = true;
    loader.load(
      looks[index].src,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        card.texture = texture;
        card.material.uniforms.uMap.value = texture;
        card.material.uniforms.uHasMap.value = 1;
        noteLoaded();
      },
      undefined,
      () => {
        // A missing frame stays a warm placeholder rather than blocking the
        // reveal on a broken image.
        noteLoaded();
      },
    );
  };

  const layout = () => {
    for (let index = 0; index < cards.length; index++) {
      const card = cards[index];
      const distance = signedDelta(index, offset);
      const absolute = Math.abs(distance);

      // Beyond the visible span, park the card and skip its work.
      if (absolute > 6) {
        card.mesh.visible = false;
        continue;
      }
      card.mesh.visible = true;

      const angle = distance * ANGLE_STEP;
      card.mesh.position.x = Math.sin(angle) * ARC_RADIUS;
      card.mesh.position.z = Math.cos(angle) * ARC_RADIUS - ARC_RADIUS;
      card.mesh.position.y = Math.sin(absolute * 0.6) * -0.06;
      card.mesh.rotation.y = -angle * 0.85;

      const closeness = Math.max(0, 1 - absolute / 3.4);
      const scale = 0.82 + closeness * 0.18;
      card.mesh.scale.setScalar(scale);
      card.material.uniforms.uDim.value = Math.min(0.55, absolute * 0.16);
      card.material.uniforms.uOpacity.value = Math.max(0, 1 - absolute / 5.2);
      card.mesh.renderOrder = 100 - Math.round(absolute * 10);
    }

    const active = wrapIndex(Math.round(offset));
    for (let i = active - LOAD_WINDOW; i <= active + LOAD_WINDOW; i++) {
      ensureTexture(wrapIndex(i));
    }
    if (active !== lastActive) {
      lastActive = active;
      onActiveChange?.(looks[active], active);
    }
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  let frame = 0;
  const tick = () => {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    if (paused) return;

    if (!dragging) {
      if (Math.abs(velocity) > 0.0002) {
        offset += velocity;
        velocity *= 0.92;
        target = Math.round(offset);
      } else {
        velocity = 0;
        // Ease toward the snapped target.
        const delta = target - offset;
        if (Math.abs(delta) > 0.0005) {
          offset += delta * (reduced.matches ? 1 : 0.14);
        } else {
          offset = target;
        }
      }
    }

    layout();
    render();
  };

  /* --------------------------------------------------------- interaction */
  const pointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    dragging = true;
    moved = 0;
    dragAxis = null;
    dragDy = 0;
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartOffset = offset;
    velocity = 0;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-grabbing');
  };

  const pointerMove = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    dragDy = dy;
    moved = Math.max(moved, Math.abs(dx), Math.abs(dy));

    // Lock the axis once the gesture commits, so a swipe up for the details
    // never also spins the rail.
    if (!dragAxis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      dragAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (dragAxis === 'y') return;

    // One card per ~140px of travel.
    offset = dragStartOffset - dx / 140;
  };

  const pointerUp = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    canvas.classList.remove('is-grabbing');
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (dragAxis === 'y') {
      if (Math.abs(dragDy) > 60) onVerticalSwipe?.(dragDy < 0 ? 'up' : 'down');
      target = Math.round(offset);
      return;
    }

    if (moved < 6) {
      // A tap, not a drag: centre what was tapped, or open the centre card.
      const picked = pick(event);
      const active = Math.round(offset);
      if (picked !== null && picked !== active) {
        // Centre the tapped card by the shortest way round the loop.
        target = offset + signedDelta(picked, offset);
      } else {
        const activeWrapped = wrapIndex(active);
        onSelect?.(looks[activeWrapped], activeWrapped);
      }
      return;
    }
    target = Math.round(offset);
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pick = (event: PointerEvent): number | null => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      cards.filter((card) => card.mesh.visible).map((card) => card.mesh),
    );
    return hits.length ? (hits[0].object.userData.index as number) : null;
  };

  let wheelTimer = 0;
  const onWheel = (event: WheelEvent) => {
    const amount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    if (!amount) return; // vertical scrolling still scrolls the page
    event.preventDefault();
    offset += amount / 260;
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => {
      target = Math.round(offset);
    }, 90);
  };

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // On a phone the centre look should dominate, with its neighbours just
    // peeking in from the edges; on wide screens the whole arc reads.
    camera.position.z = width < 620 ? 7.8 : 7.4;
    camera.updateProjectionMatrix();
    layout();
    render();
  };

  resize();
  frame = requestAnimationFrame(tick);

  return {
    goTo(index, immediate = false) {
      target = offset + signedDelta(index, offset);
      velocity = 0;
      if (immediate || reduced.matches) offset = target;
    },
    step(delta) {
      target = Math.round(target) + delta;
      velocity = 0;
    },
    activeIndex: () => wrapIndex(Math.round(offset)),
    resize,
    setPaused(value) {
      paused = value;
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('wheel', onWheel);
      for (const card of cards) {
        card.texture?.dispose();
        card.material.dispose();
      }
      geometry.dispose();
      renderer.dispose();
    },
  };
}
