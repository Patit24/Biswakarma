import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

// Helper to create procedural wood texture (high-res noise/grain)
function createWoodTexture(type) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  let baseColor, lineColor;
  if (type === "walnut") {
    baseColor = "#36271c";
    lineColor = "#1e130c";
  } else if (type === "oak") {
    baseColor = "#af9372";
    lineColor = "#856d50";
  } else {
    // ash
    baseColor = "#c5b7a7";
    lineColor = "#9e9182";
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 1024, 1024);

  // High-fidelity grain
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.8;
  for (let i = -50; i < 150; i++) {
    ctx.beginPath();
    let startY = i * 10;
    ctx.moveTo(-50, startY);
    for (let x = 0; x <= 1024 + 50; x += 15) {
      let knotX = 512;
      let knotY = 512;
      let distToKnot = Math.sqrt((x - knotX) ** 2 + (startY - knotY) ** 2);
      let ripple = Math.sin(distToKnot * 0.04) * 10;
      let noise = Math.sin(x * 0.006 + i * 0.7) * 12 + Math.cos(x * 0.015) * 4;
      ctx.lineTo(x, startY + noise + ripple);
    }
    ctx.stroke();
  }

  // Micro-wood grain texture noise
  for (let j = 0; j < 80000; j++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const size = Math.random() * 1.2;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
    ctx.fillRect(rx, ry, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Helper to create procedural marble texture
function createMarbleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#ded8cf"; // Ivory Travertine
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine fractal veins
  ctx.strokeStyle = "rgba(60, 55, 50, 0.22)";
  ctx.lineWidth = 1.2;
  
  const drawVein = (sx, sy, angle, len, depth) => {
    if (depth <= 0) return;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    let cx = sx;
    let cy = sy;
    for (let i = 0; i < len; i += 8) {
      cx += Math.cos(angle) * 8 + (Math.random() - 0.5) * 6;
      cy += Math.sin(angle) * 8 + (Math.random() - 0.5) * 6;
      ctx.lineTo(cx, cy);
      if (Math.random() > 0.93 && depth > 1) {
        drawVein(cx, cy, angle + (Math.random() - 0.5) * 0.7, len / 2, depth - 1);
      }
    }
    ctx.stroke();
  };

  for (let i = 0; i < 10; i++) {
    drawVein(Math.random() * 1024, Math.random() * 1024, Math.random() * Math.PI * 2, 350, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to create leather bump map
function createLeatherTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 512; i += 4) {
    for (let j = 0; j < 512; j += 4) {
      let offsetVal = Math.random() * 16 - 8;
      let hex = Math.floor(128 + offsetVal);
      ctx.fillStyle = `rgb(${hex},${hex},${hex})`;
      ctx.fillRect(i + (j % 8 === 0 ? 2 : 0), j, 2.5, 2.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

export function ThreeCanvas({ 
  currentSection = 0, 
  activeWood = "walnut", 
  activeFabric = "leather", 
  activeMetal = "steel",
  explodedMode = false,
  drawerOpen = false,
  lightMode = false,
  onModelLoadComplete = () => {}
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  
  // Lighting references for Day/Night dynamic cross-fade
  const ambientLightRef = useRef(null);
  const spotlightRef = useRef(null);
  const skyLightRef = useRef(null);
  
  // Furniture groups
  const chairGroupRef = useRef(null);
  const tableGroupRef = useRef(null);
  const bedGroupRef = useRef(null);
  const deskGroupRef = useRef(null);
  const loungeGroupRef = useRef(null);
  const particleGroupRef = useRef(null);

  const materialsRef = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE SETUP
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTS (Architectural Showroom Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, lightMode ? 0.75 : 0.2);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Warm Ambient Spotlight 1 (Gives rich glow)
    const spotlight = new THREE.SpotLight(0xfff5ea, lightMode ? 1.5 : 10, 20, Math.PI / 5, 0.4, 1.2);
    spotlight.position.set(0, 7, 2.5);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    spotlight.shadow.bias = -0.0008;
    scene.add(spotlight);
    spotlightRef.current = spotlight;

    // Cool Sky-reflection Directional Light
    const skyLight = new THREE.DirectionalLight(lightMode ? 0xfffdfa : 0xeaefff, lightMode ? 1.6 : 0.85);
    skyLight.position.set(-5, 4, 3);
    scene.add(skyLight);
    skyLightRef.current = skyLight;

    // Warm Ambient side bounce light
    const bounceLight = new THREE.DirectionalLight(0xffedd5, 0.55);
    bounceLight.position.set(4, 2, -2);
    scene.add(bounceLight);

    // Floor shadow plane
    const shadowGeo = new THREE.PlaneGeometry(20, 20);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.5 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.35;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Architectural Pedestal (Walnut + Steel Rim)
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -1.4;
    
    const standGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.1, 64);
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x111112,
      roughness: 0.55,
      metalness: 0.9,
    });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.receiveShadow = true;
    pedestalGroup.add(stand);

    const rimGeo = new THREE.CylinderGeometry(2.21, 2.21, 0.03, 64, 1, true);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xeae3d5,
      roughness: 0.2,
      metalness: 0.95,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.04;
    pedestalGroup.add(rim);
    scene.add(pedestalGroup);

    // ==========================================
    // PROCEDURAL MATERIAL DEFINITIONS
    // ==========================================
    const woodMap = createWoodTexture(activeWood);
    const marbleMap = createMarbleTexture();
    const leatherBump = createLeatherTexture();

    const woodMat = new THREE.MeshStandardMaterial({
      map: woodMap,
      roughness: 0.3,
      metalness: 0.05,
    });
    materialsRef.current.wood = woodMat;

    const metalMat = new THREE.MeshStandardMaterial({
      color: activeMetal === "steel" ? 0x8a8d91 : 0x222426,
      roughness: activeMetal === "steel" ? 0.2 : 0.45,
      metalness: 0.98,
    });
    materialsRef.current.metal = metalMat;

    const fabricMat = new THREE.MeshStandardMaterial({
      color: activeFabric === "leather" ? 0x121213 : 0xe3decb,
      roughness: activeFabric === "leather" ? 0.45 : 0.8,
      metalness: activeFabric === "leather" ? 0.15 : 0.0,
      bumpMap: activeFabric === "leather" ? leatherBump : null,
      bumpScale: 0.015,
    });
    materialsRef.current.fabric = fabricMat;

    const stoneMat = new THREE.MeshStandardMaterial({
      map: marbleMap,
      roughness: 0.18,
      metalness: 0.08,
    });
    materialsRef.current.stone = stoneMat;

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x181a1d,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.92,
      ior: 1.52,
      thickness: 0.12,
    });
    materialsRef.current.glass = glassMat;

    // ==========================================
    // 3D FURNITURE MODEL BUILDING (PROCEDURAL REFINEMENTS)
    // ==========================================
    
    // 1. ARMCHAIR (Living Room / Hero)
    const chairGroup = new THREE.Group();
    chairGroupRef.current = chairGroup;

    // Walnut Veneer Backrest Support Shell
    const backShellGeo = new THREE.BoxGeometry(1.24, 0.74, 0.06);
    const backShell = new THREE.Mesh(backShellGeo, woodMat);
    backShell.position.set(0, 0.5, -0.48);
    backShell.rotation.x = 0.15;
    backShell.castShadow = true;
    backShell.userData = { name: "backShell", explode: { x: 0, y: 0.25, z: -0.35 } };
    chairGroup.add(backShell);

    // Backrest Cushion (Leather/Fabric)
    const backCushionGeo = new THREE.BoxGeometry(1.18, 0.68, 0.1);
    const backCushion = new THREE.Mesh(backCushionGeo, fabricMat);
    backCushion.position.set(0, 0.5, -0.41);
    backCushion.rotation.x = 0.15;
    backCushion.castShadow = true;
    backCushion.userData = { name: "backCushion", explode: { x: 0, y: 0.35, z: -0.2 } };
    chairGroup.add(backCushion);

    // Walnut Veneer Seat Support Shell
    const seatShellGeo = new THREE.BoxGeometry(1.24, 0.06, 1.14);
    const seatShell = new THREE.Mesh(seatShellGeo, woodMat);
    seatShell.position.set(0, -0.15, 0.02);
    seatShell.castShadow = true;
    seatShell.userData = { name: "seatShell", explode: { x: 0, y: 0.05, z: 0 } };
    chairGroup.add(seatShell);

    // Seat cushion (Leather/Fabric)
    const seatCushionGeo = new THREE.BoxGeometry(1.18, 0.18, 1.08);
    const seatCushion = new THREE.Mesh(seatCushionGeo, fabricMat);
    seatCushion.position.set(0, -0.04, 0.02);
    seatCushion.castShadow = true;
    seatCushion.userData = { name: "seatCushion", explode: { x: 0, y: 0.2, z: 0 } };
    chairGroup.add(seatCushion);

    // Wooden Side Armrests
    const armLeftGeo = new THREE.BoxGeometry(0.06, 0.45, 1.08);
    const armLeft = new THREE.Mesh(armLeftGeo, woodMat);
    armLeft.position.set(-0.63, 0.15, 0.05);
    armLeft.castShadow = true;
    armLeft.userData = { name: "armLeft", explode: { x: -0.25, y: 0.05, z: 0 } };
    chairGroup.add(armLeft);

    const armRight = armLeft.clone();
    armRight.position.x = 0.63;
    armRight.userData = { name: "armRight", explode: { x: 0.25, y: 0.05, z: 0 } };
    chairGroup.add(armRight);

    // Steel Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.75, 16);
    const legFL = new THREE.Mesh(legGeo, metalMat);
    legFL.position.set(-0.54, -0.52, 0.42);
    legFL.rotation.z = 0.12;
    legFL.rotation.x = -0.05;
    legFL.castShadow = true;
    legFL.userData = { name: "legFL", explode: { x: -0.15, y: -0.25, z: 0.15 } };
    chairGroup.add(legFL);

    const legFR = legFL.clone();
    legFR.position.x = 0.54;
    legFR.rotation.z = -0.12;
    legFR.userData = { name: "legFR", explode: { x: 0.15, y: -0.25, z: 0.15 } };
    chairGroup.add(legFR);

    const legBL = legFL.clone();
    legBL.position.z = -0.42;
    legBL.rotation.x = 0.12;
    legBL.userData = { name: "legBL", explode: { x: -0.15, y: -0.25, z: -0.15 } };
    chairGroup.add(legBL);

    const legBR = legFR.clone();
    legBR.position.z = -0.42;
    legBR.rotation.x = 0.12;
    legBR.userData = { name: "legBR", explode: { x: 0.15, y: -0.25, z: -0.15 } };
    chairGroup.add(legBR);

    // Joint Screws/Bolts details
    const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8);
    const boltL = new THREE.Mesh(boltGeo, metalMat);
    boltL.position.set(-0.52, -0.15, 0.2);
    boltL.rotation.z = Math.PI / 2;
    boltL.userData = { name: "boltL", explode: { x: -0.1, y: 0.02, z: 0 } };
    chairGroup.add(boltL);

    const boltR = boltL.clone();
    boltR.position.x = 0.52;
    boltR.userData = { name: "boltR", explode: { x: 0.1, y: 0.02, z: 0 } };
    chairGroup.add(boltR);

    scene.add(chairGroup);

    // 2. DINING TABLE (Refined Marble Top + Concrete pillars + Feet Caps)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, -12, 0);
    tableGroupRef.current = tableGroup;

    // Marble Top Slab
    const topGeo = new THREE.BoxGeometry(2.3, 0.1, 1.3);
    const tableTop = new THREE.Mesh(topGeo, stoneMat);
    tableTop.position.set(0, 0.5, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableTop.userData = { name: "tableTop", explode: { x: 0, y: 0.45, z: 0 } };
    tableGroup.add(tableTop);

    // Concrete columns
    const baseGeo = new THREE.CylinderGeometry(0.32, 0.42, 1.05, 8);
    const baseLeft = new THREE.Mesh(baseGeo, woodMat);
    baseLeft.position.set(-0.65, -0.08, 0);
    baseLeft.castShadow = true;
    baseLeft.userData = { name: "baseLeft", explode: { x: -0.3, y: -0.15, z: 0 } };
    tableGroup.add(baseLeft);

    const baseRight = baseLeft.clone();
    baseRight.position.x = 0.65;
    baseRight.userData = { name: "baseRight", explode: { x: 0.3, y: -0.15, z: 0 } };
    tableGroup.add(baseRight);

    // Feet caps details
    const feetCapGeo = new THREE.CylinderGeometry(0.425, 0.425, 0.04, 8);
    const feetCapL = new THREE.Mesh(feetCapGeo, metalMat);
    feetCapL.position.set(-0.65, -0.6, 0);
    feetCapL.userData = { name: "feetCapL", explode: { x: -0.3, y: -0.25, z: 0 } };
    tableGroup.add(feetCapL);

    const feetCapR = feetCapL.clone();
    feetCapR.position.x = 0.65;
    feetCapR.userData = { name: "feetCapR", explode: { x: 0.3, y: -0.25, z: 0 } };
    tableGroup.add(feetCapR);

    scene.add(tableGroup);

    // 3. BED (Platform + Bedside ledges)
    const bedGroup = new THREE.Group();
    bedGroup.position.set(0, -12, 0);
    bedGroupRef.current = bedGroup;

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(1.7, 0.34, 1.9);
    const mattress = new THREE.Mesh(mattressGeo, fabricMat);
    mattress.position.set(0, -0.2, 0.25);
    mattress.castShadow = true;
    mattress.userData = { name: "mattress", explode: { x: 0, y: 0.25, z: 0.2 } };
    bedGroup.add(mattress);

    // Wood frame base
    const bedFrameGeo = new THREE.BoxGeometry(1.8, 0.14, 2.0);
    const bedFrame = new THREE.Mesh(bedFrameGeo, woodMat);
    bedFrame.position.set(0, -0.44, 0.25);
    bedFrame.castShadow = true;
    bedFrame.userData = { name: "bedFrame", explode: { x: 0, y: -0.15, z: 0 } };
    bedGroup.add(bedFrame);

    // Walnut Headboard Support Board
    const headboardGeo = new THREE.BoxGeometry(1.8, 1.05, 0.1);
    const headboard = new THREE.Mesh(headboardGeo, woodMat);
    headboard.position.set(0, 0.15, -0.8);
    headboard.castShadow = true;
    headboard.userData = { name: "headboard", explode: { x: 0, y: 0.2, z: -0.35 } };
    bedGroup.add(headboard);

    // Fabric Backboard Cushion
    const backboardGeo = new THREE.BoxGeometry(1.68, 0.75, 0.08);
    const backboard = new THREE.Mesh(backboardGeo, fabricMat);
    backboard.position.set(0, 0.15, -0.71);
    backboard.castShadow = true;
    backboard.userData = { name: "backboard", explode: { x: 0, y: 0.3, z: -0.2 } };
    bedGroup.add(backboard);

    // Bedside Ledges (Cantilevered wood boxes)
    const ledgeGeo = new THREE.BoxGeometry(0.35, 0.08, 0.4);
    const ledgeL = new THREE.Mesh(ledgeGeo, woodMat);
    ledgeL.position.set(-1.08, -0.35, -0.4);
    ledgeL.castShadow = true;
    ledgeL.userData = { name: "ledgeL", explode: { x: -0.2, y: -0.05, z: 0 } };
    bedGroup.add(ledgeL);

    const ledgeR = ledgeL.clone();
    ledgeR.position.x = 1.08;
    ledgeR.userData = { name: "ledgeR", explode: { x: 0.2, y: -0.05, z: 0 } };
    bedGroup.add(ledgeR);

    scene.add(bedGroup);

    // 4. DESK (Grommet + Handles details)
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, -12, 0);
    deskGroupRef.current = deskGroup;

    // Wood Top
    const deskTopGeo = new THREE.BoxGeometry(1.9, 0.07, 0.95);
    const deskTop = new THREE.Mesh(deskTopGeo, woodMat);
    deskTop.position.set(0, 0.5, 0);
    deskTop.castShadow = true;
    deskTop.userData = { name: "deskTop", explode: { x: 0, y: 0.25, z: 0 } };
    deskGroup.add(deskTop);

    // Desktop grommet detailing
    const grommetGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.075, 16);
    const grommet = new THREE.Mesh(grommetGeo, metalMat);
    grommet.position.set(-0.75, 0.505, -0.3);
    grommet.userData = { name: "grommet", explode: { x: -0.05, y: 0.32, z: -0.05 } };
    deskGroup.add(grommet);

    // Steel leg frames
    const deskLegGeo = new THREE.BoxGeometry(0.06, 0.96, 0.85);
    const deskLegL = new THREE.Mesh(deskLegGeo, metalMat);
    deskLegL.position.set(-0.85, -0.02, 0);
    deskLegL.castShadow = true;
    deskLegL.userData = { name: "deskLegL", explode: { x: -0.25, y: -0.15, z: 0 } };
    deskGroup.add(deskLegL);

    const deskLegR = deskLegL.clone();
    deskLegR.position.x = 0.85;
    deskLegR.userData = { name: "deskLegR", explode: { x: 0.25, y: -0.15, z: 0 } };
    deskGroup.add(deskLegR);

    // Drawer cabinet
    const drawerUnitGeo = new THREE.BoxGeometry(0.48, 0.23, 0.75);
    const drawerUnit = new THREE.Mesh(drawerUnitGeo, woodMat);
    drawerUnit.position.set(0.48, 0.31, 0);
    drawerUnit.castShadow = true;
    drawerUnit.userData = { name: "drawerUnit", explode: { x: 0.08, y: 0.08, z: -0.08 } };
    deskGroup.add(drawerUnit);

    // Drawer Pull-Out Mesh
    const drawerGeo = new THREE.BoxGeometry(0.42, 0.17, 0.58);
    const drawer = new THREE.Mesh(drawerGeo, fabricMat);
    drawer.position.set(0.48, 0.31, 0.09);
    drawer.castShadow = true;
    drawer.userData = { name: "drawer", explode: { x: 0.08, y: 0.08, z: 0.35 } };
    deskGroup.add(drawer);

    // Metal handle rail detail
    const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8);
    const handle = new THREE.Mesh(handleGeo, metalMat);
    handle.position.set(0.48, 0.31, 0.385);
    handle.rotation.z = Math.PI / 2;
    handle.userData = { name: "handle", explode: { x: 0.08, y: 0.08, z: 0.42 } };
    deskGroup.add(handle);

    scene.add(deskGroup);

    // 5. LOUNGE TABLE (Smoked Glass + Metal Pedestal + Bevel Brace)
    const loungeGroup = new THREE.Group();
    loungeGroup.position.set(0, -12, 0);
    loungeGroupRef.current = loungeGroup;

    // Glass top disc
    const glassTopGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.045, 64);
    const glassTop = new THREE.Mesh(glassTopGeo, glassMat);
    glassTop.position.set(0, 0.3, 0);
    glassTop.castShadow = true;
    glassTop.userData = { name: "glassTop", explode: { x: 0, y: 0.35, z: 0 } };
    loungeGroup.add(glassTop);

    // Metal structural brace
    const braceGeo = new THREE.BoxGeometry(1.3, 0.04, 0.04);
    const braceX = new THREE.Mesh(braceGeo, metalMat);
    braceX.position.set(0, 0.26, 0);
    braceX.castShadow = true;
    braceX.userData = { name: "braceX", explode: { x: 0, y: 0.18, z: 0 } };
    loungeGroup.add(braceX);

    const braceZ = braceX.clone();
    braceZ.rotation.y = Math.PI / 2;
    braceZ.userData = { name: "braceZ", explode: { x: 0, y: 0.18, z: 0 } };
    loungeGroup.add(braceZ);

    // Tripod metal legs
    const tripLegGeo = new THREE.CylinderGeometry(0.035, 0.018, 0.85, 16);
    const tripLeg1 = new THREE.Mesh(tripLegGeo, metalMat);
    tripLeg1.position.set(0, -0.16, 0.52);
    tripLeg1.rotation.x = 0.22;
    tripLeg1.castShadow = true;
    tripLeg1.userData = { name: "tripLeg1", explode: { x: 0, y: -0.18, z: 0.28 } };
    loungeGroup.add(tripLeg1);

    const tripLeg2 = tripLeg1.clone();
    tripLeg2.position.set(0.45, -0.16, -0.26);
    tripLeg2.rotation.set(0, 0, 0);
    tripLeg2.rotation.x = -0.11;
    tripLeg2.rotation.z = -0.2;
    tripLeg2.userData = { name: "tripLeg2", explode: { x: 0.24, y: -0.18, z: -0.16 } };
    loungeGroup.add(tripLeg2);

    const tripLeg3 = tripLeg1.clone();
    tripLeg3.position.set(-0.45, -0.16, -0.26);
    tripLeg3.rotation.set(0, 0, 0);
    tripLeg3.rotation.x = -0.11;
    tripLeg3.rotation.z = 0.2;
    tripLeg3.userData = { name: "tripLeg3", explode: { x: -0.24, y: -0.18, z: -0.16 } };
    loungeGroup.add(tripLeg3);

    scene.add(loungeGroup);

    // ==========================================
    // WELDING PARTICLE EFFECT
    // ==========================================
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = 0;
      particlePositions[i + 1] = -12;
      particlePositions[i + 2] = 0;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5 + 1.2,
        z: (Math.random() - 0.5) * 1.5,
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const sparkTexture = new THREE.CanvasTexture(
      (() => {
        const c = document.createElement("canvas");
        c.width = 16;
        c.height = 16;
        const x = c.getContext("2d");
        if (x) {
          const g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
          g.addColorStop(0, "rgba(255, 235, 205, 1)");
          g.addColorStop(0.3, "rgba(255, 150, 60, 0.8)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          x.fillStyle = g;
          x.fillRect(0, 0, 16, 16);
        }
        return c;
      })()
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: sparkTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);
    particleGroupRef.current = {
      points: particlePoints,
      positions: particlePositions,
      velocities: particleVelocities,
      active: false,
      timer: 0,
      trigger: function (pos) {
        this.active = true;
        this.timer = 0;
        const positions = this.points.geometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = pos.x + (Math.random() - 0.5) * 0.12;
          positions[i + 1] = pos.y + (Math.random() - 0.5) * 0.12;
          positions[i + 2] = pos.z + (Math.random() - 0.5) * 0.12;
          
          this.velocities[i/3] = {
            x: (Math.random() - 0.5) * 2.2,
            y: (Math.random() - 0.5) * 2.2 + 1.4,
            z: (Math.random() - 0.5) * 2.2
          };
        }
        this.points.geometry.attributes.position.needsUpdate = true;
      }
    };

    onModelLoadComplete();

    // ==========================================
    // ANIMATION & RESIZE LOOPS
    // ==========================================
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating animation on whatever model is active
      const currentActiveGroup = 
        currentSection === 0 || currentSection === 1 || currentSection === 5 ? chairGroup :
        currentSection === 2 ? tableGroup :
        currentSection === 3 ? bedGroup :
        currentSection === 4 ? deskGroup : loungeGroup;

      if (currentActiveGroup) {
        currentActiveGroup.position.y += Math.sin(elapsedTime * 1.5) * 0.0003;
      }

      // Lock camera target onto the centerpiece (looks very centered and aligned)
      if (camera) {
        camera.lookAt(0, 0.08, 0);
      }

      // Spark particle physics update
      if (particleGroupRef.current && particleGroupRef.current.active) {
        const pg = particleGroupRef.current;
        pg.timer += delta;
        const positions = pg.points.geometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
          const vel = pg.velocities[i/3];
          positions[i] += vel.x * delta;
          positions[i + 1] += vel.y * delta;
          positions[i + 2] += vel.z * delta;
          vel.y -= 3.2 * delta;
        }
        pg.points.geometry.attributes.position.needsUpdate = true;
        if (pg.timer > 0.8) {
          pg.active = false;
          for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i + 1] = -12;
          }
          pg.points.geometry.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w === 0 || h === 0) continue;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const handleMouseMove = (e) => {
      if (explodedMode) return;
      const mx = (e.clientX / window.innerWidth) - 0.5;
      const my = (e.clientY / window.innerHeight) - 0.5;

      const activeGroup = 
        currentSection <= 1 || currentSection === 5 ? chairGroup :
        currentSection === 2 ? tableGroup :
        currentSection === 3 ? bedGroup :
        currentSection === 4 ? deskGroup : loungeGroup;

      if (activeGroup) {
        gsap.to(activeGroup.rotation, {
          y: mx * 1.0,
          x: my * 0.5,
          duration: 0.9,
          ease: "power2.out",
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // ==========================================
  // EFFECT: UPDATE SECTION / STORY POSITION (Horizontal Offsets)
  // ==========================================
  useEffect(() => {
    if (!sceneRef.current) return;

    const chair = chairGroupRef.current;
    const table = tableGroupRef.current;
    const bed = bedGroupRef.current;
    const desk = deskGroupRef.current;
    const lounge = loungeGroupRef.current;

    const hideY = -12;
    const showY = 0;

    // Detect if desktop layout to apply horizontal offsets opposite to the text overlay
    const isDesktop = window.innerWidth >= 768;
    const rightX = isDesktop ? 1.35 : 0; // Shift right when text is left-aligned
    const leftX = isDesktop ? -1.35 : 0;  // Shift left when text is right-aligned
    
    const triggerWeld = (pos) => {
      if (particleGroupRef.current) {
        particleGroupRef.current.trigger(pos);
      }
    };

    // Transition Models
    if (currentSection === 0 || currentSection === 1 || currentSection === 5) {
      const targetX = currentSection === 0 ? rightX : leftX;
      gsap.to(chair.position, { x: targetX, y: showY, duration: 1.2, ease: "power3.out" });
      gsap.to([table.position, bed.position, desk.position, lounge.position], { x: 0, y: hideY, duration: 0.8, ease: "power2.in" });
      
      // Camera angle
      if (currentSection === 0) {
        gsap.to(cameraRef.current.position, { x: 0, y: 1.6, z: 6.2, duration: 1.5, ease: "power3.inOut" });
      } else if (currentSection === 1) {
        gsap.to(cameraRef.current.position, { x: 0, y: 2.0, z: 4.8, duration: 1.5, ease: "power3.inOut" });
      } else {
        gsap.to(cameraRef.current.position, { x: 0, y: 1.5, z: 5.2, duration: 1.5, ease: "power3.inOut" });
      }

    } else if (currentSection === 2) {
      gsap.to(table.position, { x: rightX, y: showY, duration: 1.2, ease: "power3.out", onStart: () => triggerWeld(new THREE.Vector3(rightX, 0, 0)) });
      gsap.to([chair.position, bed.position, desk.position, lounge.position], { x: 0, y: hideY, duration: 0.8, ease: "power2.in" });
      gsap.to(cameraRef.current.position, { x: 0, y: 2.6, z: 5.8, duration: 1.5, ease: "power3.inOut" });

    } else if (currentSection === 3) {
      gsap.to(bed.position, { x: leftX, y: showY, duration: 1.2, ease: "power3.out" });
      gsap.to([chair.position, table.position, desk.position, lounge.position], { x: 0, y: hideY, duration: 0.8, ease: "power2.in" });
      gsap.to(cameraRef.current.position, { x: 0, y: 2.2, z: 5.2, duration: 1.5, ease: "power3.inOut" });

    } else if (currentSection === 4) {
      gsap.to(desk.position, { x: rightX, y: showY, duration: 1.2, ease: "power3.out" });
      gsap.to([chair.position, table.position, bed.position, lounge.position], { x: 0, y: hideY, duration: 0.8, ease: "power2.in" });
      gsap.to(cameraRef.current.position, { x: 0, y: 1.8, z: 5.2, duration: 1.5, ease: "power3.inOut" });

    } else {
      // 6 (Lounge) & 7 (Contact)
      gsap.to(lounge.position, { x: rightX, y: showY, duration: 1.2, ease: "power3.out" });
      gsap.to([chair.position, table.position, bed.position, desk.position], { x: 0, y: hideY, duration: 0.8, ease: "power2.in" });
      gsap.to(cameraRef.current.position, { x: 0, y: 1.5, z: 4.8, duration: 1.5, ease: "power3.inOut" });
    }
  }, [currentSection]);

  // ==========================================
  // EFFECT: LIGHTMODE DYNAMIC CROSS-FADE
  // ==========================================
  useEffect(() => {
    if (!ambientLightRef.current || !spotlightRef.current || !skyLightRef.current) return;
    
    if (lightMode) {
      // Day Mode (Bright studio daylight)
      gsap.to(ambientLightRef.current, { intensity: 0.75, duration: 0.8 });
      gsap.to(spotlightRef.current, { intensity: 1.5, duration: 0.8 });
      gsap.to(skyLightRef.current, { intensity: 1.6, duration: 0.8 });
      skyLightRef.current.color.set(0xfffdfa);
    } else {
      // Night Mode (Moody dark showroom)
      gsap.to(ambientLightRef.current, { intensity: 0.2, duration: 0.8 });
      gsap.to(spotlightRef.current, { intensity: 10.0, duration: 0.8 });
      gsap.to(skyLightRef.current, { intensity: 0.85, duration: 0.8 });
      skyLightRef.current.color.set(0xeaefff);
    }
  }, [lightMode]);

  // ==========================================
  // EFFECT: WOOD/FABRIC/METAL MATERIAL SWAP
  // ==========================================
  useEffect(() => {
    if (!materialsRef.current.wood) return;
    const woodMap = createWoodTexture(activeWood);
    materialsRef.current.wood.map = woodMap;
    materialsRef.current.wood.needsUpdate = true;
  }, [activeWood]);

  useEffect(() => {
    if (!materialsRef.current.fabric) return;
    const leatherBump = createLeatherTexture();
    materialsRef.current.fabric.color.set(activeFabric === "leather" ? 0x121213 : 0xe3decb);
    materialsRef.current.fabric.roughness = activeFabric === "leather" ? 0.45 : 0.8;
    materialsRef.current.fabric.metalness = activeFabric === "leather" ? 0.15 : 0.0;
    materialsRef.current.fabric.bumpMap = activeFabric === "leather" ? leatherBump : null;
    materialsRef.current.fabric.needsUpdate = true;
  }, [activeFabric]);

  useEffect(() => {
    if (!materialsRef.current.metal) return;
    materialsRef.current.metal.color.set(activeMetal === "steel" ? 0x8a8d91 : 0x222426);
    materialsRef.current.metal.roughness = activeMetal === "steel" ? 0.2 : 0.45;
    materialsRef.current.metal.needsUpdate = true;
  }, [activeMetal]);

  // ==========================================
  // EFFECT: EXPLODED VIEW MODE
  // ==========================================
  useEffect(() => {
    const activeGroup = 
      currentSection <= 1 || currentSection === 5 ? chairGroupRef.current :
      currentSection === 2 ? tableGroupRef.current :
      currentSection === 3 ? bedGroupRef.current :
      currentSection === 4 ? deskGroupRef.current : loungeGroupRef.current;

    if (!activeGroup) return;

    activeGroup.children.forEach(mesh => {
      const targetPos = explodedMode 
        ? (mesh.userData.explode || { x: 0, y: 0, z: 0 }) 
        : { x: 0, y: 0, z: 0 };
      
      const defaultY = mesh.userData.name === "backShell" ? 0.5 :
                      mesh.userData.name === "backCushion" ? 0.5 :
                      mesh.userData.name === "seatShell" ? -0.15 :
                      mesh.userData.name === "seatCushion" ? -0.04 :
                      mesh.userData.name === "armLeft" || mesh.userData.name === "armRight" ? 0.15 :
                      mesh.userData.name === "legFL" || mesh.userData.name === "legFR" || mesh.userData.name === "legBL" || mesh.userData.name === "legBR" ? -0.52 :
                      mesh.userData.name === "boltL" || mesh.userData.name === "boltR" ? -0.15 :
                      mesh.userData.name === "tableTop" ? 0.5 :
                      mesh.userData.name === "baseLeft" || mesh.userData.name === "baseRight" ? -0.08 :
                      mesh.userData.name === "feetCapL" || mesh.userData.name === "feetCapR" ? -0.6 :
                      mesh.userData.name === "mattress" ? -0.2 :
                      mesh.userData.name === "bedFrame" ? -0.44 :
                      mesh.userData.name === "headboard" ? 0.15 :
                      mesh.userData.name === "backboard" ? 0.15 :
                      mesh.userData.name === "ledgeL" || mesh.userData.name === "ledgeR" ? -0.35 :
                      mesh.userData.name === "deskTop" ? 0.5 :
                      mesh.userData.name === "grommet" ? 0.505 :
                      mesh.userData.name === "deskLegL" || mesh.userData.name === "deskLegR" ? -0.02 :
                      mesh.userData.name === "drawerUnit" ? 0.31 :
                      mesh.userData.name === "drawer" ? 0.31 :
                      mesh.userData.name === "handle" ? 0.31 :
                      mesh.userData.name === "glassTop" ? 0.3 :
                      mesh.userData.name === "braceX" || mesh.userData.name === "braceZ" ? 0.26 : -0.16;

      const defaultX = mesh.userData.name === "armLeft" ? -0.63 :
                      mesh.userData.name === "armRight" ? 0.63 :
                      mesh.userData.name === "legFL" || mesh.userData.name === "legBL" ? -0.54 :
                      mesh.userData.name === "legFR" || mesh.userData.name === "legBR" ? 0.54 :
                      mesh.userData.name === "boltL" ? -0.52 :
                      mesh.userData.name === "boltR" ? 0.52 :
                      mesh.userData.name === "baseLeft" || mesh.userData.name === "feetCapL" ? -0.65 :
                      mesh.userData.name === "baseRight" || mesh.userData.name === "feetCapR" ? 0.65 :
                      mesh.userData.name === "ledgeL" ? -1.08 :
                      mesh.userData.name === "ledgeR" ? 1.08 :
                      mesh.userData.name === "deskLegL" ? -0.85 :
                      mesh.userData.name === "grommet" ? -0.75 :
                      mesh.userData.name === "deskLegR" ? 0.85 :
                      mesh.userData.name === "drawerUnit" || mesh.userData.name === "drawer" || mesh.userData.name === "handle" ? 0.48 :
                      mesh.userData.name === "tripLeg2" ? 0.45 :
                      mesh.userData.name === "tripLeg3" ? -0.45 : 0;

      const defaultZ = mesh.userData.name === "backShell" ? -0.48 :
                      mesh.userData.name === "backCushion" ? -0.41 :
                      mesh.userData.name === "seatShell" || mesh.userData.name === "seatCushion" ? 0.02 :
                      mesh.userData.name === "armLeft" || mesh.userData.name === "armRight" ? 0.05 :
                      mesh.userData.name === "legFL" || mesh.userData.name === "legFR" ? 0.42 :
                      mesh.userData.name === "legBL" || mesh.userData.name === "legBR" ? -0.42 :
                      mesh.userData.name === "boltL" || mesh.userData.name === "boltR" ? 0.2 :
                      mesh.userData.name === "mattress" || mesh.userData.name === "bedFrame" ? 0.25 :
                      mesh.userData.name === "headboard" ? -0.8 :
                      mesh.userData.name === "backboard" ? -0.71 :
                      mesh.userData.name === "ledgeL" || mesh.userData.name === "ledgeR" ? -0.4 :
                      mesh.userData.name === "grommet" ? -0.3 :
                      mesh.userData.name === "drawer" ? 0.09 :
                      mesh.userData.name === "handle" ? 0.385 :
                      mesh.userData.name === "tripLeg1" ? 0.52 :
                      mesh.userData.name === "tripLeg2" || mesh.userData.name === "tripLeg3" ? -0.26 : 0;

      gsap.to(mesh.position, {
        x: defaultX + targetPos.x,
        y: defaultY + targetPos.y,
        z: defaultZ + targetPos.z,
        duration: 1.0,
        ease: "power3.inOut"
      });
    });

  }, [explodedMode, currentSection]);

  // ==========================================
  // EFFECT: DESK DRAWER OPEN
  // ==========================================
  useEffect(() => {
    const desk = deskGroupRef.current;
    if (!desk) return;
    const drawerMesh = desk.children.find(c => c.userData.name === "drawer");
    const handleMesh = desk.children.find(c => c.userData.name === "handle");
    if (!drawerMesh || !handleMesh) return;

    const targetDrawerZ = drawerOpen ? 0.55 : 0.09;
    const targetHandleZ = drawerOpen ? 0.845 : 0.385;

    gsap.to(drawerMesh.position, { z: targetDrawerZ, duration: 0.8, ease: "power2.inOut" });
    gsap.to(handleMesh.position, { z: targetHandleZ, duration: 0.8, ease: "power2.inOut" });
  }, [drawerOpen]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-700" 
    />
  );
}
