/**
 * PS1-Style Low-Poly Archer Girl - Complete Scene Module
 * All geometry is procedural, all textures drawn on offscreen canvas.
 * Classic PS1 aesthetic: vertex snapping, low resolution, flat shading.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ============================================================
// CONSTANTS & PALETTE
// ============================================================
const RESOLUTION_SCALES: Record<string, number> = {
  '240p': 0.25,
  '360p': 0.375,
  '480p': 0.5,
};

const PALETTES: Record<string, Record<string, number>> = {
  Forest: {
    skin: 0xd4a574,
    hood: 0x2d5a27,
    vest: 0x5c3a1e,
    shirt: 0x8b7355,
    belt: 0x3d2b1f,
    pants: 0x4a6741,
    boots: 0x2b1d0e,
    bow: 0x6b4423,
    quiver: 0x5c3a1e,
    arrow: 0x8b7355,
    bg: 0x1a2e1a,
    fog: 0x1a2e1a,
    ground: 0x2d4a2d,
  },
  Desert: {
    skin: 0xd4a574,
    hood: 0xc4a35a,
    vest: 0x8b6914,
    shirt: 0xd4b896,
    belt: 0x5c4033,
    pants: 0xb8860b,
    boots: 0x3d2b1f,
    bow: 0x8b6914,
    quiver: 0x6b4423,
    arrow: 0xc4a35a,
    bg: 0x2e2a1a,
    fog: 0x2e2a1a,
    ground: 0x4a3d2d,
  },
  Night: {
    skin: 0xb8956a,
    hood: 0x1a1a3d,
    vest: 0x2d2d4a,
    shirt: 0x4a4a6b,
    belt: 0x1a1a2d,
    pants: 0x2d2d5c,
    boots: 0x0d0d1a,
    bow: 0x3d3d6b,
    quiver: 0x2d2d4a,
    arrow: 0x5c5c8b,
    bg: 0x0a0a1a,
    fog: 0x0a0a1a,
    ground: 0x1a1a3d,
  },
};

// Size constants
const HEAD_SIZE = 0.28;
const TORSO_WIDTH = 0.32;
const TORSO_HEIGHT = 0.38;
const ARM_LENGTH = 0.35;
const LEG_LENGTH = 0.4;
const BOW_HEIGHT = 0.7;
const QUIVER_HEIGHT = 0.5;

// ============================================================
// GLOBAL STATE
// ============================================================
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let clock: THREE.Clock;
let archerGroup: THREE.Group;
let pedestal: THREE.Group;
let blobShadow: THREE.Mesh;

let currentPalette = 'Forest';
let currentPose = 'Idle';
let ps1Enabled = true;
let wireframeEnabled = false;
let autoRotate = false;
let ps1FpsMode = false;
let resolutionScale = 0.25;

let cameraTarget = { x: 0, y: 0.4, z: 0 };
let cameraLerping = false;
let cameraLerpTarget = new THREE.Vector3();
let cameraLerpPosition = new THREE.Vector3();
let cameraLerpProgress = 0;

let lastPoseUpdate = 0;
const POSE_FPS_INTERVAL = 1 / 12;

// Pose target rotations
const POSES: Record<string, Record<string, { x: number; y: number; z: number }>> = {
  Idle: {
    head: { x: 0, y: 0, z: 0 },
    // Left arm (bow arm): ~15 degrees forward, elbow bent ~70 degrees
    armLeft: { x: -0.26, y: 0.05, z: 0.1 },
    elbowLeft: { x: -1.22, y: 0, z: 0 },
    // Right arm: relaxed at side
    armRight: { x: 0, y: 0, z: -0.15 },
    elbowRight: { x: -0.2, y: 0, z: 0 },
    legLeft: { x: 0, y: 0, z: 0 },
    legRight: { x: 0, y: 0, z: 0 },
    kneeLeft: { x: 0, y: 0, z: 0 },
    kneeRight: { x: 0, y: 0, z: 0 },
    // Bow: diagonal ~45 degrees across body
    bow: { x: 0, y: 0, z: 0.785 },
  },
  Aim: {
    head: { x: 0, y: -0.3, z: 0 },
    // Left arm: extended forward at shoulder height
    armLeft: { x: -1.57, y: 0.1, z: 0.2 },
    elbowLeft: { x: -0.1, y: 0, z: 0 },
    // Right arm: brought across to nock point, elbow slightly below hand
    armRight: { x: -1.4, y: -0.4, z: -0.5 },
    elbowRight: { x: -0.6, y: 0, z: 0 },
    legLeft: { x: -0.15, y: 0, z: 0.05 },
    legRight: { x: 0.15, y: 0, z: -0.05 },
    kneeLeft: { x: 0.1, y: 0, z: 0 },
    kneeRight: { x: 0, y: 0, z: 0 },
    // Bow: vertical, string facing +Z (away from body)
    bow: { x: 0, y: 0, z: 0 },
  },
  Draw: {
    head: { x: 0, y: -0.4, z: 0 },
    // Left arm: fully extended forward
    armLeft: { x: -1.57, y: 0.05, z: 0.3 },
    elbowLeft: { x: 0, y: 0, z: 0 },
    // Right arm: pulled back to right cheek corner
    armRight: { x: -1.3, y: -0.6, z: -0.8 },
    elbowRight: { x: -1.1, y: 0, z: 0 },
    legLeft: { x: -0.2, y: 0, z: 0.1 },
    legRight: { x: 0.2, y: 0, z: -0.1 },
    kneeLeft: { x: 0.15, y: 0, z: 0 },
    kneeRight: { x: 0.05, y: 0, z: 0 },
    // Bow: vertical, string stretched
    bow: { x: 0, y: 0, z: 0 },
  },
};

// Materials collection for palette switching
const materials: Record<string, THREE.MeshLambertMaterial> = {};

// ============================================================
// TEXTURE GENERATION
// ============================================================
function makeTexture(drawCallback: (ctx: CanvasRenderingContext2D, size: number) => void, size: number = 64): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  drawCallback(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = 1;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createSkinTexture(): THREE.Texture {
  return makeTexture((ctx, size) => {
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(0, 0, size, size);
    // Add subtle noise
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
      ctx.fillRect(x, y, 2, 2);
    }
  });
}

function createFabricTexture(baseColor: string): THREE.Texture {
  return makeTexture((ctx, size) => {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    // Weave pattern
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
  });
}

function createWoodTexture(): THREE.Texture {
  return makeTexture((ctx, size) => {
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(0, 0, size, size);
    // Wood grain
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i + Math.random() * 2);
      ctx.bezierCurveTo(size * 0.3, i + Math.random() * 4, size * 0.7, i - Math.random() * 4, size, i + Math.random() * 2);
      ctx.stroke();
    }
  });
}

function createGroundTexture(): THREE.Texture {
  return makeTexture((ctx, size) => {
    ctx.fillStyle = '#2d4a2d';
    ctx.fillRect(0, 0, size, size);
    // Stone pattern
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 3 + Math.random() * 8;
      ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${80 + Math.random() * 40}, 0.3)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ============================================================
// PS1 SHADER PATCHING
// ============================================================
function patchPS1Shader(material: THREE.Material, pixelGridSize: number = 2.0) {
  (material as any).onBeforeCompile = (shader: any) => {
    // Vertex snapping - add after projection in vertex shader
    // The project_vertex chunk sets gl_Position = projectionMatrix * mvPosition;
    shader.vertexShader = shader.vertexShader.replace(
      'gl_Position = projectionMatrix * mvPosition;',
      `gl_Position = projectionMatrix * mvPosition;
      // PS1 vertex snapping - quantize to pixel grid for classic jitter
      gl_Position.xyz = floor(gl_Position.xyz * ${pixelGridSize.toFixed(1)} + 0.5) / ${pixelGridSize.toFixed(1)};`
    );

    // 5-bit color quantization in fragment (PS1 color banding)
    // Handle both expanded and unexpanded include forms
    if (shader.fragmentShader.includes('#include <output_fragment>')) {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `#include <output_fragment>
        // PS1 5-bit color quantization
        gl_FragColor.rgb = floor(gl_FragColor.rgb * 31.0 + 0.5) / 31.0;`
      );
    } else {
      // Already expanded - add after the output line
      shader.fragmentShader = shader.fragmentShader.replace(
        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
        `gl_FragColor = vec4( outgoingLight, diffuseColor.a );
        // PS1 5-bit color quantization
        gl_FragColor.rgb = floor(gl_FragColor.rgb * 31.0 + 0.5) / 31.0;`
      );
    }
  };
}

// ============================================================
// CHARACTER BUILD FUNCTIONS
// ============================================================
function createMaterial(color: number, name: string): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
  });
  materials[name] = mat;
  if (ps1Enabled) {
    patchPS1Shader(mat, 2.0);
  }
  return mat;
}

function createHead(): THREE.Group {
  const head = new THREE.Group();
  head.name = 'head';

  // Face - boxy
  const faceGeo = new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE * 1.1, HEAD_SIZE * 0.9);
  faceGeo.toNonIndexed();
  const faceMat = createMaterial(PALETTES[currentPalette].skin, 'skin');
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.y = 0;
  head.add(face);

  // Eyes - two small dark boxes
  const eyeGeo = new THREE.BoxGeometry(0.04, 0.04, 0.02);
  const eyeMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true });
  const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
  eyeLeft.position.set(-0.06, 0.03, HEAD_SIZE * 0.46);
  head.add(eyeLeft);
  const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
  eyeRight.position.set(0.06, 0.03, HEAD_SIZE * 0.46);
  head.add(eyeRight);

  // Mouth
  const mouthGeo = new THREE.BoxGeometry(0.06, 0.02, 0.02);
  const mouthMat = new THREE.MeshLambertMaterial({ color: 0x8b4513, flatShading: true });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.06, HEAD_SIZE * 0.46);
  head.add(mouth);

  // Hood - ONE garment enveloping the whole head
  const hoodMat = new THREE.MeshLambertMaterial({
    color: PALETTES[currentPalette].hood,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  materials['hood'] = hoodMat as THREE.MeshLambertMaterial;
  if (ps1Enabled) {
    patchPS1Shader(hoodMat, 2.0);
  }
  
  // Hood group to contain all hood parts
  const hoodGroup = new THREE.Group();
  hoodGroup.name = 'hood';
  
  // Skull wrap: CylinderGeometry with opening at front (+Z)
  // thetaStart=0.95, thetaLength=2*PI-1.9 creates ~110 degree missing sector at front
  const skullWrapGeo = new THREE.CylinderGeometry(
    0.13,  // radiusTop (at crown)
    0.19,  // radiusBottom (at brow)
    0.26,  // height
    6,     // radialSegments
    1,     // heightSegments
    true,  // openEnded
    0.95,  // thetaStart - starts at side
    Math.PI * 2 - 1.9  // thetaLength - leaves 1.9 radian gap at front
  );
  skullWrapGeo.toNonIndexed();
  const skullWrap = new THREE.Mesh(skullWrapGeo, hoodMat);
  // Position so bottom rim is at brow line (y=0.08)
  skullWrap.position.set(0, 0.08 + 0.13, 0); // Center is at brow + half height
  hoodGroup.add(skullWrap);
  
  // Hood point: ConeGeometry seated on skull-wrap top rim
  const hoodPointGeo = new THREE.ConeGeometry(0.13, 0.30, 6);
  hoodPointGeo.toNonIndexed();
  const hoodPoint = new THREE.Mesh(hoodPointGeo, hoodMat);
  // Base at skull-wrap top rim (y = 0.08 + 0.26 = 0.34)
  hoodPoint.position.set(0, 0.34 + 0.15, 0); // Center is at top + half height
  hoodPoint.rotation.x = -0.21; // Tilted ~12 degrees backward
  hoodGroup.add(hoodPoint);
  
  // Collar skirt: Full ring from brow line to shoulders
  const collarSkirtGeo = new THREE.CylinderGeometry(
    0.19,  // radiusTop (at brow)
    0.26,  // radiusBottom (at shoulders)
    0.12,  // height
    6,     // radialSegments
    1,     // heightSegments
    true   // openEnded
  );
  collarSkirtGeo.toNonIndexed();
  const collarSkirt = new THREE.Mesh(collarSkirtGeo, hoodMat);
  // Position so top overlaps skull-wrap bottom by >= 0.02
  // Top at y=0.08, bottom at y=-0.04
  collarSkirt.position.set(0, 0.08 - 0.06, 0); // Center is at brow - half height
  hoodGroup.add(collarSkirt);
  
  head.add(hoodGroup);

  // Hair peeking out (small boxes at sides)
  const hairGeo = new THREE.BoxGeometry(0.05, 0.12, 0.08);
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x8b4513, flatShading: true });
  const hairLeft = new THREE.Mesh(hairGeo, hairMat);
  hairLeft.position.set(-HEAD_SIZE * 0.45, -0.08, 0.02);
  head.add(hairLeft);
  const hairRight = new THREE.Mesh(hairGeo, hairMat);
  hairRight.position.set(HEAD_SIZE * 0.45, -0.08, 0.02);
  head.add(hairRight);

  // Back hair
  const backHairGeo = new THREE.BoxGeometry(HEAD_SIZE * 0.8, 0.15, 0.06);
  const backHair = new THREE.Mesh(backHairGeo, hairMat);
  backHair.position.set(0, -0.1, -HEAD_SIZE * 0.4);
  head.add(backHair);

  head.position.y = TORSO_HEIGHT * 0.5 + HEAD_SIZE * 0.55;
  return head;
}

function createTorso(): THREE.Group {
  const torso = new THREE.Group();
  torso.name = 'torso';

  // Main vest body
  const vestGeo = new THREE.BoxGeometry(TORSO_WIDTH, TORSO_HEIGHT, TORSO_WIDTH * 0.7);
  vestGeo.toNonIndexed();
  const vestMat = createMaterial(PALETTES[currentPalette].vest, 'vest');
  const vest = new THREE.Mesh(vestGeo, vestMat);
  torso.add(vest);

  // Shirt underneath (slightly larger)
  const shirtGeo = new THREE.BoxGeometry(TORSO_WIDTH * 0.95, TORSO_HEIGHT * 0.95, TORSO_WIDTH * 0.65);
  shirtGeo.toNonIndexed();
  const shirtMat = createMaterial(PALETTES[currentPalette].shirt, 'shirt');
  const shirt = new THREE.Mesh(shirtGeo, shirtMat);
  shirt.position.z = 0.01; // Offset to avoid z-fighting
  torso.add(shirt);

  // Belt strap material (used for belt and pouches)
  const strapMat = createMaterial(PALETTES[currentPalette].belt, 'belt');

  // Belt
  const beltGeo = new THREE.BoxGeometry(TORSO_WIDTH * 1.05, 0.05, TORSO_WIDTH * 0.75);
  beltGeo.toNonIndexed();
  const belt = new THREE.Mesh(beltGeo, strapMat);
  belt.position.y = -TORSO_HEIGHT * 0.4;
  torso.add(belt);

  // Belt buckle
  const buckleGeo = new THREE.BoxGeometry(0.05, 0.04, 0.02);
  const buckleMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0, flatShading: true });
  const buckle = new THREE.Mesh(buckleGeo, buckleMat);
  buckle.position.set(0, -TORSO_HEIGHT * 0.4, TORSO_WIDTH * 0.38);
  torso.add(buckle);

  // Pouches (two small boxes on belt)
  const pouchGeo = new THREE.BoxGeometry(0.07, 0.06, 0.05);
  pouchGeo.toNonIndexed();
  const pouchMat = createMaterial(PALETTES[currentPalette].quiver, 'quiver');

  const pouch1 = new THREE.Mesh(pouchGeo, pouchMat);
  pouch1.position.set(-0.12, -TORSO_HEIGHT * 0.42, TORSO_WIDTH * 0.35);
  torso.add(pouch1);

  const pouch2 = new THREE.Mesh(pouchGeo, pouchMat);
  pouch2.position.set(0.12, -TORSO_HEIGHT * 0.42, TORSO_WIDTH * 0.35);
  torso.add(pouch2);

  // Shoulders (small box extensions)
  const shoulderGeo = new THREE.BoxGeometry(0.1, 0.08, 0.1);
  shoulderGeo.toNonIndexed();
  const shoulderL = new THREE.Mesh(shoulderGeo, vestMat);
  shoulderL.position.set(-TORSO_WIDTH * 0.55, TORSO_HEIGHT * 0.35, 0);
  torso.add(shoulderL);
  const shoulderR = new THREE.Mesh(shoulderGeo, vestMat);
  shoulderR.position.set(TORSO_WIDTH * 0.55, TORSO_HEIGHT * 0.35, 0);
  torso.add(shoulderR);

  return torso;
}

function createArm(isLeft: boolean): THREE.Group {
  const side = isLeft ? 'Left' : 'Right';
  const armGroup = new THREE.Group();
  armGroup.name = `arm${side}`;

  const sign = isLeft ? -1 : 1;

  // Upper arm
  const upperArmGeo = new THREE.BoxGeometry(0.08, ARM_LENGTH * 0.5, 0.08);
  upperArmGeo.toNonIndexed();
  const armMat = createMaterial(PALETTES[currentPalette].shirt, 'shirt');
  const upperArm = new THREE.Mesh(upperArmGeo, armMat);
  upperArm.position.y = -ARM_LENGTH * 0.25;
  armGroup.add(upperArm);

  // Elbow pivot
  const elbowGroup = new THREE.Group();
  elbowGroup.name = `elbow${side}`;
  elbowGroup.position.y = -ARM_LENGTH * 0.5;

  // Forearm
  const forearmGeo = new THREE.BoxGeometry(0.07, ARM_LENGTH * 0.45, 0.07);
  forearmGeo.toNonIndexed();
  const forearm = new THREE.Mesh(forearmGeo, armMat);
  forearm.position.y = -ARM_LENGTH * 0.22;
  elbowGroup.add(forearm);

  // Hand - as a Group so bow can be parented to it
  const handGroup = new THREE.Group();
  handGroup.name = `hand${side}`;
  handGroup.position.y = -ARM_LENGTH * 0.48;
  
  const handGeo = new THREE.BoxGeometry(0.06, 0.06, 0.05);
  handGeo.toNonIndexed();
  const handMat = createMaterial(PALETTES[currentPalette].skin, 'skin');
  const hand = new THREE.Mesh(handGeo, handMat);
  handGroup.add(hand);
  
  elbowGroup.add(handGroup);

  // Glove/bracer
  const bracerGeo = new THREE.BoxGeometry(0.075, 0.08, 0.075);
  bracerGeo.toNonIndexed();
  const bracerMat = createMaterial(PALETTES[currentPalette].boots, 'boots');
  const bracer = new THREE.Mesh(bracerGeo, bracerMat);
  bracer.position.y = -ARM_LENGTH * 0.38;
  elbowGroup.add(bracer);

  armGroup.add(elbowGroup);

  // Position at shoulder
  armGroup.position.set(sign * (TORSO_WIDTH * 0.55 + 0.05), TORSO_HEIGHT * 0.35, 0);

  return armGroup;
}

function createLeg(isLeft: boolean): THREE.Group {
  const side = isLeft ? 'Left' : 'Right';
  const legGroup = new THREE.Group();
  legGroup.name = `leg${side}`;

  const sign = isLeft ? -1 : 1;

  // Upper leg
  const upperLegGeo = new THREE.BoxGeometry(0.1, LEG_LENGTH * 0.5, 0.1);
  upperLegGeo.toNonIndexed();
  const pantsMat = createMaterial(PALETTES[currentPalette].pants, 'pants');
  const upperLeg = new THREE.Mesh(upperLegGeo, pantsMat);
  upperLeg.position.y = -LEG_LENGTH * 0.25;
  legGroup.add(upperLeg);

  // Knee pivot
  const kneeGroup = new THREE.Group();
  kneeGroup.name = `knee${side}`;
  kneeGroup.position.y = -LEG_LENGTH * 0.5;

  // Lower leg
  const lowerLegGeo = new THREE.BoxGeometry(0.09, LEG_LENGTH * 0.5, 0.09);
  lowerLegGeo.toNonIndexed();
  const lowerLeg = new THREE.Mesh(lowerLegGeo, pantsMat);
  lowerLeg.position.y = -LEG_LENGTH * 0.25;
  kneeGroup.add(lowerLeg);

  // Boot
  const bootGeo = new THREE.BoxGeometry(0.11, 0.12, 0.14);
  bootGeo.toNonIndexed();
  const bootMat = createMaterial(PALETTES[currentPalette].boots, 'boots');
  const boot = new THREE.Mesh(bootGeo, bootMat);
  boot.position.set(0, -LEG_LENGTH * 0.5, 0.02);
  kneeGroup.add(boot);

  legGroup.add(kneeGroup);

  // Position at hip
  legGroup.position.set(sign * 0.08, -TORSO_HEIGHT * 0.45, 0);

  return legGroup;
}

function createBow(): THREE.Group {
  const bowGroup = new THREE.Group();
  bowGroup.name = 'bowHand';

  // Recurve bow shape using TubeGeometry
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -BOW_HEIGHT * 0.5, 0),
    new THREE.Vector3(0.08, -BOW_HEIGHT * 0.3, 0),
    new THREE.Vector3(0.12, -BOW_HEIGHT * 0.1, 0),
    new THREE.Vector3(0.1, BOW_HEIGHT * 0.1, 0),
    new THREE.Vector3(0.05, BOW_HEIGHT * 0.3, 0),
    new THREE.Vector3(0, BOW_HEIGHT * 0.5, 0),
  ]);

  const bowGeo = new THREE.TubeGeometry(curve, 4, 0.015, 4, false);
  bowGeo.toNonIndexed();
  const bowMat = createMaterial(PALETTES[currentPalette].bow, 'bow');
  const bow = new THREE.Mesh(bowGeo, bowMat);
  bowGroup.add(bow);

  // Bowstring - two thin cylinders meeting at nock point
  const stringMat = new THREE.MeshLambertMaterial({ color: 0xcccccc, flatShading: true });

  const stringTopGeo = new THREE.CylinderGeometry(0.003, 0.003, BOW_HEIGHT * 0.5, 3);
  const stringTop = new THREE.Mesh(stringTopGeo, stringMat);
  stringTop.position.set(-0.02, BOW_HEIGHT * 0.25, 0);
  stringTop.rotation.z = 0.08;
  bowGroup.add(stringTop);

  const stringBottomGeo = new THREE.CylinderGeometry(0.003, 0.003, BOW_HEIGHT * 0.5, 3);
  const stringBottom = new THREE.Mesh(stringBottomGeo, stringMat);
  stringBottom.position.set(-0.02, -BOW_HEIGHT * 0.25, 0);
  stringBottom.rotation.z = -0.08;
  bowGroup.add(stringBottom);

  // Grip wrapping - positioned at the center of the bow
  const gripGeo = new THREE.BoxGeometry(0.03, 0.08, 0.03);
  const gripMat = createMaterial(PALETTES[currentPalette].belt, 'belt');
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.set(0.1, 0, 0);
  bowGroup.add(grip);

  // Bow is now parented to handLeft group, so position is relative to hand
  // Bow should be vertical with grip at hand center
  bowGroup.position.set(0, 0, 0);
  bowGroup.rotation.set(0, 0, 0);

  return bowGroup;
}

function createQuiver(): THREE.Group {
  const quiverGroup = new THREE.Group();
  quiverGroup.name = 'quiver';

  // Quiver body - 6-sided cylinder
  const quiverGeo = new THREE.CylinderGeometry(0.04, 0.05, QUIVER_HEIGHT, 6);
  quiverGeo.toNonIndexed();
  const quiverMat = createMaterial(PALETTES[currentPalette].quiver, 'quiver');
  const quiver = new THREE.Mesh(quiverGeo, quiverMat);
  quiverGroup.add(quiver);

  // Quiver cap
  const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 6);
  capGeo.toNonIndexed();
  const capMat = createMaterial(PALETTES[currentPalette].belt, 'belt');
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = QUIVER_HEIGHT * 0.5;
  quiverGroup.add(cap);

  // Arrows (4 arrows sticking out the top)
  const arrowMat = createMaterial(PALETTES[currentPalette].arrow, 'arrow');
  const tipMat = new THREE.MeshLambertMaterial({ color: 0x808080, flatShading: true });

  for (let i = 0; i < 4; i++) {
    const arrowGroup = new THREE.Group();

    // Arrow shaft
    const shaftGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.35, 4);
    const shaft = new THREE.Mesh(shaftGeo, arrowMat);
    arrowGroup.add(shaft);

    // Arrow tip (cone)
    const tipGeo = new THREE.ConeGeometry(0.012, 0.04, 4);
    tipGeo.toNonIndexed();
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 0.19;
    arrowGroup.add(tip);

    // Feathers (two crossed planes)
    const featherGeo = new THREE.PlaneGeometry(0.03, 0.04);
    const featherMat = new THREE.MeshLambertMaterial({
      color: 0xcc3333,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const feather1 = new THREE.Mesh(featherGeo, featherMat);
    feather1.position.y = -0.14;
    arrowGroup.add(feather1);

    const feather2 = new THREE.Mesh(featherGeo, featherMat);
    feather2.position.y = -0.14;
    feather2.rotation.y = Math.PI * 0.5;
    arrowGroup.add(feather2);

    // Position arrows in quiver
    const angle = (i / 4) * Math.PI * 2;
    arrowGroup.position.set(
      Math.cos(angle) * 0.02,
      QUIVER_HEIGHT * 0.3 + i * 0.02,
      Math.sin(angle) * 0.02
    );
    arrowGroup.rotation.z = (Math.random() - 0.5) * 0.1;

    quiverGroup.add(arrowGroup);
  }

  // Quiver strap
  const strapGeo = new THREE.BoxGeometry(0.02, QUIVER_HEIGHT * 0.8, 0.01);
  const strapMat = createMaterial(PALETTES[currentPalette].belt, 'belt');
  const strap = new THREE.Mesh(strapGeo, strapMat);
  strap.position.set(0, 0, 0.05);
  quiverGroup.add(strap);

  // Position quiver on back, tilted
  quiverGroup.position.set(0.05, 0.05, -TORSO_WIDTH * 0.45);
  quiverGroup.rotation.x = 0.2;
  quiverGroup.rotation.z = -0.15;

  return quiverGroup;
}

// ============================================================
// SCENE SETUP
// ============================================================
function createPedestal(): THREE.Group {
  const pedestalGroup = new THREE.Group();
  pedestalGroup.name = 'pedestal';

  // Main pedestal cylinder
  const pedGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.15, 10);
  pedGeo.toNonIndexed();
  const pedMat = new THREE.MeshLambertMaterial({ color: 0x555555, flatShading: true });
  const ped = new THREE.Mesh(pedGeo, pedMat);
  ped.position.y = -0.075;
  pedestalGroup.add(ped);

  // Top surface
  const topGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.02, 10);
  topGeo.toNonIndexed();
  const topMat = new THREE.MeshLambertMaterial({ color: 0x666666, flatShading: true });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.01;
  pedestalGroup.add(top);

  // Polar grid rings
  for (let r = 0; r < 3; r++) {
    const ringGeo = new THREE.TorusGeometry(0.2 + r * 0.25, 0.005, 3, 10);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI * 0.5;
    ring.position.y = 0.025;
    pedestalGroup.add(ring);
  }

  // Radial lines
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const lineGeo = new THREE.BoxGeometry(0.005, 0.005, 0.7);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.y = 0.025;
    line.rotation.y = angle;
    line.position.x = Math.sin(angle) * 0.35;
    line.position.z = Math.cos(angle) * 0.35;
    pedestalGroup.add(line);
  }

  return pedestalGroup;
}

function createBlobShadow(): THREE.Mesh {
  const shadowGeo = new THREE.CircleGeometry(0.3, 8);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.02;
  return shadow;
}

function setupLights(): void {
  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Main directional light (no shadows for PS1 style)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
  fillLight.position.set(-3, 2, -2);
  scene.add(fillLight);

  // Rim light
  const rimLight = new THREE.DirectionalLight(0xffffcc, 0.2);
  rimLight.position.set(0, -1, -3);
  scene.add(rimLight);
}

function buildArcher(): THREE.Group {
  archerGroup = new THREE.Group();
  archerGroup.name = 'archer';

  // Build body parts
  const head = createHead();
  const torso = createTorso();
  const armLeft = createArm(true);
  const armRight = createArm(false);
  const legLeft = createLeg(true);
  const legRight = createLeg(false);
  const bow = createBow();
  const quiver = createQuiver();

  // Assemble
  torso.add(head);
  torso.add(armLeft);
  torso.add(armRight);
  torso.add(legLeft);
  torso.add(legRight);
  torso.add(quiver);

  // Parent bow to left hand group so it follows arm poses
  const handLeft = armLeft.getObjectByName('handLeft') as THREE.Group;
  if (handLeft) {
    handLeft.add(bow);
  }

  archerGroup.add(torso);

  // Position archer on pedestal
  archerGroup.position.y = 0.55;

  return archerGroup;
}

// ============================================================
// POSE SYSTEM
// ============================================================
function setPose(name: string): void {
  currentPose = name;
  // Run self-checks after pose change
  setTimeout(() => runSelfChecks(), 100); // Small delay to allow pose to settle
}

function updatePose(delta: number): void {
  if (ps1FpsMode) {
    lastPoseUpdate += delta;
    if (lastPoseUpdate < POSE_FPS_INTERVAL) return;
    lastPoseUpdate = 0;
  }

  const pose = POSES[currentPose];
  if (!pose) return;

  const lerpSpeed = 3.0 * delta;
  const torso = archerGroup.getObjectByName('torso') as THREE.Group;
  if (!torso) return;

  // Breathing bob for idle
  const breathOffset = Math.sin(clock.getElapsedTime() * 2) * 0.005;

  // Head
  const head = torso.getObjectByName('head') as THREE.Group;
  if (head && pose.head) {
    head.rotation.x += (pose.head.x - head.rotation.x) * lerpSpeed;
    head.rotation.y += (pose.head.y - head.rotation.y) * lerpSpeed;
    head.rotation.z += (pose.head.z - head.rotation.z) * lerpSpeed;
    if (currentPose === 'Idle') {
      head.position.y = TORSO_HEIGHT * 0.5 + HEAD_SIZE * 0.55 + breathOffset;
    }
  }

  // Arms
  ['Left', 'Right'].forEach((side) => {
    const arm = torso.getObjectByName(`arm${side}`) as THREE.Group;
    const elbow = torso.getObjectByName(`elbow${side}`) as THREE.Group;
    const poseArm = pose[`arm${side}`];
    const poseElbow = pose[`elbow${side}`];

    if (arm && poseArm) {
      arm.rotation.x += (poseArm.x - arm.rotation.x) * lerpSpeed;
      arm.rotation.y += (poseArm.y - arm.rotation.y) * lerpSpeed;
      arm.rotation.z += (poseArm.z - arm.rotation.z) * lerpSpeed;
    }
    if (elbow && poseElbow) {
      elbow.rotation.x += (poseElbow.x - elbow.rotation.x) * lerpSpeed;
      elbow.rotation.y += (poseElbow.y - elbow.rotation.y) * lerpSpeed;
      elbow.rotation.z += (poseElbow.z - elbow.rotation.z) * lerpSpeed;
    }
  });

  // Legs
  ['Left', 'Right'].forEach((side) => {
    const leg = torso.getObjectByName(`leg${side}`) as THREE.Group;
    const knee = torso.getObjectByName(`knee${side}`) as THREE.Group;
    const poseLeg = pose[`leg${side}`];
    const poseKnee = pose[`knee${side}`];

    if (leg && poseLeg) {
      leg.rotation.x += (poseLeg.x - leg.rotation.x) * lerpSpeed;
      leg.rotation.y += (poseLeg.y - leg.rotation.y) * lerpSpeed;
      leg.rotation.z += (poseLeg.z - leg.rotation.z) * lerpSpeed;
    }
    if (knee && poseKnee) {
      knee.rotation.x += (poseKnee.x - knee.rotation.x) * lerpSpeed;
      knee.rotation.y += (poseKnee.y - knee.rotation.y) * lerpSpeed;
      knee.rotation.z += (poseKnee.z - knee.rotation.z) * lerpSpeed;
    }
  });

  // Bow rotation (parented to handLeft)
  const bow = archerGroup.getObjectByName('bowHand') as THREE.Group;
  if (bow && pose.bow) {
    bow.rotation.x += (pose.bow.x - bow.rotation.x) * lerpSpeed;
    bow.rotation.y += (pose.bow.y - bow.rotation.y) * lerpSpeed;
    bow.rotation.z += (pose.bow.z - bow.rotation.z) * lerpSpeed;
  }
}

// ============================================================
// PALETTE SYSTEM
// ============================================================
function applyPalette(name: string): void {
  currentPalette = name;
  const pal = PALETTES[name];
  if (!pal) return;

  // Update material colors
  Object.entries(materials).forEach(([key, mat]) => {
    if (pal[key] !== undefined) {
      mat.color.setHex(pal[key]);
    }
  });

  // Update background and fog
  scene.background = new THREE.Color(pal.bg);
  if (scene.fog) {
    (scene.fog as THREE.Fog).color.setHex(pal.fog);
  }

  // Update ground color
  const ground = scene.getObjectByName('ground');
  if (ground) {
    (ground as THREE.Mesh).material = new THREE.MeshLambertMaterial({
      color: pal.ground,
      flatShading: true,
    });
  }
}

// ============================================================
// RESOLUTION
// ============================================================
function setResolution(scaleName: string): void {
  resolutionScale = RESOLUTION_SCALES[scaleName] || 0.25;
  resizeRenderer();
}

function resizeRenderer(): void {
  if (!renderer) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(
    Math.floor(width * resolutionScale),
    Math.floor(height * resolutionScale),
    false
  );
  renderer.setPixelRatio(1);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// ============================================================
// CAMERA PRESETS
// ============================================================
function setCameraPreset(preset: string): void {
  const dist = 4;
  let pos = new THREE.Vector3(0, 0.4, dist);

  switch (preset) {
    case 'front':
      pos.set(0, 0.4, dist);
      break;
    case 'side':
      pos.set(dist, 0.4, 0);
      break;
    case 'back':
      pos.set(0, 0.4, -dist);
      break;
    case 'top':
      pos.set(0, dist * 1.2, 0.01);
      break;
    case 'reset':
      pos.set(2, 1.5, 3);
      break;
  }

  cameraLerpPosition.copy(pos);
  cameraLerpTarget.set(0, 0.4, 0);
  cameraLerping = true;
  cameraLerpProgress = 0;
}

function updateCameraLerp(delta: number): void {
  if (!cameraLerping) return;

  cameraLerpProgress += delta * 2;
  if (cameraLerpProgress >= 1) {
    cameraLerpProgress = 1;
    cameraLerping = false;
  }

  const t = smoothstep(cameraLerpProgress);
  camera.position.lerp(cameraLerpPosition, t * 0.1);
  controls.target.lerp(cameraLerpTarget, t * 0.1);
  controls.update();
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ============================================================
// INITIALIZATION
// ============================================================
export function initScene(container: HTMLElement): void {
  // Scene
  scene = new THREE.Scene();
  const bgColor = PALETTES[currentPalette].bg;
  scene.background = new THREE.Color(bgColor);
  scene.fog = new THREE.Fog(bgColor, 5, 15);

  // Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(2, 1.5, 3);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  resizeRenderer();
  container.appendChild(renderer.domElement);
  renderer.domElement.style.imageRendering = 'pixelated';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  // Clock
  clock = new THREE.Clock();

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.4, 0);
  controls.minDistance = 2;
  controls.maxDistance = 12;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 2;

  // Lights
  setupLights();

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(10, 10);
  const groundMat = new THREE.MeshLambertMaterial({
    color: PALETTES[currentPalette].ground,
    flatShading: true,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI * 0.5;
  ground.position.y = -0.08;
  ground.name = 'ground';
  scene.add(ground);

  // Pedestal
  pedestal = createPedestal();
  scene.add(pedestal);

  // Blob shadow
  blobShadow = createBlobShadow();
  scene.add(blobShadow);

  // Build archer
  buildArcher();
  scene.add(archerGroup);

  // Run initial self-checks
  setTimeout(() => runSelfChecks(), 200);

  // Start animation
  animate();

  // Resize handler
  window.addEventListener('resize', onResize);
}

function onResize(): void {
  resizeRenderer();
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update controls
  if (autoRotate) {
    controls.autoRotate = true;
  } else {
    controls.autoRotate = false;
  }
  controls.update();

  // Camera lerp
  updateCameraLerp(delta);

  // Update pose
  updatePose(delta);

  // Render
  renderer.render(scene, camera);

  // Update triangle counter
  updateTriangleCounter();
}

function updateTriangleCounter(): void {
  const counter = document.getElementById('triangle-counter');
  if (counter && renderer) {
    const triangles = renderer.info.render.triangles;
    counter.textContent = `Triangles: ${triangles}`;
  }
}

// ============================================================
// RUNTIME SELF-CHECKS
// ============================================================
function runSelfChecks(): void {
  console.log('=== Runtime Self-Checks ===');
  
  const torso = archerGroup.getObjectByName('torso') as THREE.Group;
  if (!torso) {
    console.log('1. GRIP: FAIL - torso not found');
    return;
  }
  
  // Get world positions
  const handLeft = torso.getObjectByName('handLeft') as THREE.Group;
  const bowGroup = archerGroup.getObjectByName('bowHand') as THREE.Group;
  const handRight = torso.getObjectByName('handRight') as THREE.Group;
  const head = torso.getObjectByName('head') as THREE.Group;
  const hoodGroup = head?.getObjectByName('hood') as THREE.Group;
  
  // Check 1: GRIP - bow grip anchor to handLeft palm center
  if (handLeft && bowGroup) {
    const handWorldPos = new THREE.Vector3();
    handLeft.getWorldPosition(handWorldPos);
    
    // Bow grip is at the center of the bow group (where the grip mesh is)
    const gripMesh = bowGroup.children.find(c => c.name === 'grip') as THREE.Mesh;
    const gripWorldPos = new THREE.Vector3();
    if (gripMesh) {
      gripMesh.getWorldPosition(gripWorldPos);
    } else {
      bowGroup.getWorldPosition(gripWorldPos);
    }
    
    const gripDistance = handWorldPos.distanceTo(gripWorldPos);
    const gripPass = gripDistance < 0.02;
    console.log(`1. GRIP: ${gripPass ? 'PASS' : 'FAIL'} - distance: ${gripDistance.toFixed(4)} (must be < 0.02)`);
  } else {
    console.log('1. GRIP: FAIL - handLeft or bowGroup not found');
  }
  
  // Check 2: HANDS - right hand to bowstring nock in AIM and DRAW
  if (currentPose === 'Aim' || currentPose === 'Draw') {
    if (handRight && bowGroup) {
      const handWorldPos = new THREE.Vector3();
      handRight.getWorldPosition(handWorldPos);
      
      // Bowstring nock is where the two string segments meet (at the center, slightly offset)
      // Approximate as the center of the bow group
      const nockWorldPos = new THREE.Vector3();
      bowGroup.getWorldPosition(nockWorldPos);
      
      const handsDistance = handWorldPos.distanceTo(nockWorldPos);
      const handsPass = handsDistance < 0.03;
      console.log(`2. HANDS: ${handsPass ? 'PASS' : 'FAIL'} - distance: ${handsDistance.toFixed(4)} (must be < 0.03)`);
    } else {
      console.log('2. HANDS: FAIL - handRight or bowGroup not found');
    }
  } else {
    console.log('2. HANDS: SKIP - not in AIM or DRAW pose');
  }
  
  // Check 3: HOOD - hood box vs head box
  if (hoodGroup && head) {
    const hoodBox = new THREE.Box3().setFromObject(hoodGroup);
    const headBox = new THREE.Box3().setFromObject(head);
    
    // hood.min.y <= head.min.y + 0.02 (skirt reaches below the skull)
    const hoodMinY = hoodBox.min.y;
    const headMinY = headBox.min.y;
    const hoodMinPass = hoodMinY <= headMinY + 0.02;
    
    // hood.max.y >= head.max.y + 0.15 (point above crown)
    const hoodMaxY = hoodBox.max.y;
    const headMaxY = headBox.max.y;
    const hoodMaxPass = hoodMaxY >= headMaxY + 0.15;
    
    // hood box center x/z within 0.01 of head center x/z
    const hoodCenter = new THREE.Vector3();
    hoodBox.getCenter(hoodCenter);
    const headCenter = new THREE.Vector3();
    headBox.getCenter(headCenter);
    const hoodCenterXPass = Math.abs(hoodCenter.x - headCenter.x) < 0.01;
    const hoodCenterZPass = Math.abs(hoodCenter.z - headCenter.z) < 0.01;
    
    const hoodPass = hoodMinPass && hoodMaxPass && hoodCenterXPass && hoodCenterZPass;
    console.log(`3. HOOD: ${hoodPass ? 'PASS' : 'FAIL'}`);
    console.log(`   - minY: ${hoodMinPass ? 'PASS' : 'FAIL'} - hood: ${hoodMinY.toFixed(4)}, head: ${headMinY.toFixed(4)}`);
    console.log(`   - maxY: ${hoodMaxPass ? 'PASS' : 'FAIL'} - hood: ${hoodMaxY.toFixed(4)}, head: ${headMaxY.toFixed(4)}`);
    console.log(`   - centerX: ${hoodCenterXPass ? 'PASS' : 'FAIL'} - hood: ${hoodCenter.x.toFixed(4)}, head: ${headCenter.x.toFixed(4)}`);
    console.log(`   - centerZ: ${hoodCenterZPass ? 'PASS' : 'FAIL'} - hood: ${hoodCenter.z.toFixed(4)}, head: ${headCenter.z.toFixed(4)}`);
  } else {
    console.log('3. HOOD: FAIL - hoodGroup or head not found');
  }
  
  // Check 4: FACE - eyes z > hood front rim z at eye height
  if (head && hoodGroup) {
    const eyeLeft = head.children.find(c => c instanceof THREE.Mesh && c.position.y === 0.03 && c.position.x < 0) as THREE.Mesh;
    if (eyeLeft) {
      const eyeWorldPos = new THREE.Vector3();
      eyeLeft.getWorldPosition(eyeWorldPos);
      
      // Get hood front rim z at eye height
      // The hood front rim is at the opening of the skull wrap
      // Approximate as the hood group center z + some offset
      const hoodWorldPos = new THREE.Vector3();
      hoodGroup.getWorldPosition(hoodWorldPos);
      
      // The front rim should be behind the eyes (less z)
      const hoodFrontRimZ = hoodWorldPos.z + 0.13; // Approximate front rim position
      
      const facePass = eyeWorldPos.z > hoodFrontRimZ;
      console.log(`4. FACE: ${facePass ? 'PASS' : 'FAIL'} - eye z: ${eyeWorldPos.z.toFixed(4)}, hood front rim z: ${hoodFrontRimZ.toFixed(4)}`);
    } else {
      console.log('4. FACE: FAIL - eyeLeft not found');
    }
  } else {
    console.log('4. FACE: FAIL - head or hoodGroup not found');
  }
  
  console.log('=== End Self-Checks ===');
}

// ============================================================
// PUBLIC API FOR UI
// ============================================================
export function toggleAutoRotate(): boolean {
  autoRotate = !autoRotate;
  return autoRotate;
}

export function toggleWireframe(): boolean {
  wireframeEnabled = !wireframeEnabled;
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshLambertMaterial) {
      obj.material.wireframe = wireframeEnabled;
    }
  });
  return wireframeEnabled;
}

export function togglePS1(): boolean {
  ps1Enabled = !ps1Enabled;
  // Re-patch or remove patches
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material) {
      const mat = obj.material as THREE.MeshLambertMaterial;
      if (ps1Enabled) {
        patchPS1Shader(mat, 2.0);
      } else {
        (mat as any).onBeforeCompile = undefined;
      }
      mat.needsUpdate = true;
    }
  });
  return ps1Enabled;
}

export function togglePS1Fps(): boolean {
  ps1FpsMode = !ps1FpsMode;
  return ps1FpsMode;
}

export function takeScreenshot(): void {
  if (!renderer) return;
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'ps1-archer-girl.png';
  link.href = dataURL;
  link.click();
}

export { setPose, applyPalette, setResolution, setCameraPreset };
