import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import "./theatre3d.css";

const SEAT_GAP = 1.12;
const AISLE_WIDTH = 1.35;
const ROW_GAP = 1.85;
const ROW_RISE = 0.55;
const FIRST_ROW_Z = 6.4;

const BALCONY_Y = 5.15;
const BALCONY_GAP = 4.2;
const BALCONY_ROW_GAP = 1.7;
const BALCONY_RISE = 0.38;

const SCREEN_W = 16.4;
const SCREEN_H = 7.05;
const SCREEN_Y = 5.55;
const SCREEN_Z = -0.04;

const TIER_COLORS = {
  Standard: 0x6b243c,
  Premium: 0xb12f4e,
  Recliner: 0xc9a15a,
  Balcony: 0x6e3aa0,
};

const SELECTED_COLOR = 0xff4d73;
const BOOKED_COLOR = 0x1c1b22;
const HOVER_EMISSIVE = 0x3a1420;

const OVERVIEW_LIMITS = {
  minDistance: 4,
  maxDistance: 14,
  minPolarAngle: 0.05,
  maxPolarAngle: Math.PI - 0.05,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
};

function makePlaceholderTexture(title = "CINEHUB") {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 1600, 700);
  gradient.addColorStop(0, "#0c101c");
  gradient.addColorStop(0.45, "#3a1528");
  gradient.addColorStop(1, "#08060c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1600, 700);

  ctx.strokeStyle = "rgba(212,175,110,.55)";
  ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, 1544, 644);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f3e6c8";
  ctx.font = "800 92px Arial";
  ctx.fillText("CINEHUB PREMIERE", 800, 250);
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.font = "36px Arial";
  ctx.fillText(title || "SELECT A MOVIE", 800, 370);
  ctx.fillStyle = "rgba(243,230,200,.7)";
  ctx.font = "24px Arial";
  ctx.fillText("CLICK THE SCREEN TO PLAY THE TRAILER", 800, 470);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeBrandTexture({
  text = "CINEHUB",
  sub = "",
  width = 1024,
  height = 256,
  bg = "#160e14",
  fg = "#f3e6c8",
  accent = "#d4af6e",
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bg);
  gradient.addColorStop(1, "#2a1520");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(8, height * 0.04);
  ctx.strokeRect(12, 12, width - 24, height - 24);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fg;
  ctx.font = `800 ${Math.floor(height * (sub ? 0.38 : 0.46))}px Arial`;
  ctx.fillText(text, width / 2, height / 2 - (sub ? height * 0.1 : 0));

  if (sub) {
    ctx.fillStyle = accent;
    ctx.font = `600 ${Math.floor(height * 0.16)}px Arial`;
    ctx.fillText(sub, width / 2, height / 2 + height * 0.22);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeSeatLabelTexture(label, selected = false, booked = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = booked ? "#141318" : selected ? "#ff4d73" : "#1a1216";
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = booked ? "#555" : selected ? "#ffd0da" : "#d4af6e";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 240, 112);
  ctx.fillStyle = booked ? "#888" : selected ? "#fff" : "#f6e7c3";
  ctx.font = "700 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeRowBadgeTexture(row) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1b1216";
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d4af6e";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#f6e7c3";
  ctx.font = "800 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(row, 64, 70);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function isDirectVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim(), window.location.href);
    return /\.(mp4|webm|ogg)(?:$|[?#])/i.test(parsed.pathname + parsed.search);
  } catch {
    return false;
  }
}

function getYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const raw = url.trim();
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = u.hostname.replace(/^(www|m)\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0] || "";
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      return m ? m[1] : null;
    }
  } catch {
    const fallback = raw.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return fallback ? fallback[1] : null;
  }
  return null;
}

export default function Theatre3D({
  rows = ["A", "B", "C", "D", "E"],
  balconyRows = ["F", "G"],
  seatsPerRow = 12,
  bookedSeats = [],
  selectedSeats = [],
  selectedMovie,
  disabled = false,
  onToggleSeat,
  getTier = () => "Standard",
  getSeatPrice,
}) {
  const theatreRef = useRef(null);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const latestRef = useRef({});

  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [mode, setMode] = useState("cinema");

  const movieTitle = selectedMovie?.title || "No movie selected";
  const videoUrl = selectedMovie?.trailer_url || "";
  const hasVideo = isDirectVideoUrl(videoUrl);
  const youtubeId = useMemo(() => getYouTubeId(videoUrl), [videoUrl]);
  const canPlay = hasVideo || Boolean(youtubeId);
  const lastSelected = selectedSeats[selectedSeats.length - 1] || null;
  const rowsKey = useMemo(() => rows.join("|"), [rows]);
  const balconyKey = useMemo(() => balconyRows.join("|"), [balconyRows]);

  latestRef.current = {
    bookedSeats,
    selectedSeats,
    disabled,
    onToggleSeat,
    videoUrl,
    youtubeId,
    movieTitle,
  };

  const tierName = (row) => {
    const t = getTier(row);
    return typeof t === "string" ? t : t?.name || "Standard";
  };

  const toggleFullscreen = useCallback(async () => {
    const element = theatreRef.current;
    if (!element) return;
    try {
      if (!document.fullscreenElement) await element.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1000;
    const height = mount.clientHeight || 560;
    const seatCount = seatsPerRow;
    const orchestraLastZ = FIRST_ROW_Z + Math.max(0, rows.length - 1) * ROW_GAP;
    const balconyFirstZ = orchestraLastZ + BALCONY_GAP;
    const balconyLastZ =
      balconyRows.length > 0
        ? balconyFirstZ + Math.max(0, balconyRows.length - 1) * BALCONY_ROW_GAP
        : orchestraLastZ;
    const lastRowZ = balconyLastZ;
    const totalSeatWidth = seatCount * SEAT_GAP + AISLE_WIDTH;
    const roomWidth = Math.max(totalSeatWidth + 10, 24);
    const rearZ = lastRowZ + 6.4;
    const frontZ = -1.35;
    const ceilingY = 12.2;
    const hallDepth = rearZ - frontZ;

    const bounds = {
      minX: -roomWidth / 2 + 1.6,
      maxX: roomWidth / 2 - 1.6,
      minY: 1.35,
      maxY: ceilingY - 1.15,
      minZ: 2.4,
      maxZ: rearZ - 1.7,
    };

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x09080e, 36, 70);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 160);
    camera.position.set(0, 8.4, Math.min(orchestraLastZ + 7.5, bounds.maxZ));

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.className = "t3d-css3d";
    Object.assign(cssRenderer.domElement.style, {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "0",
      pointerEvents: "none",
    });
    mount.appendChild(cssRenderer.domElement);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "t3d-webgl";
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "1",
    });
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;

    const hallCenter = new THREE.Vector3(
      0,
      4.8,
      (bounds.minZ + bounds.maxZ) / 2
    );
    const innerRadius = Math.max(
      4.5,
      Math.min(
        (bounds.maxX - bounds.minX) / 2 - 0.35,
        (bounds.maxZ - bounds.minZ) / 2 - 0.35,
        bounds.maxY - 1.4
      )
    );

    controls.rotateSpeed = 0.72;
    controls.autoRotate = false;

    const setOverviewLimits = (on) => {
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      controls.minPolarAngle = 0.05;
      controls.maxPolarAngle = Math.PI - 0.05;

      if (on) {
        controls.enableZoom = true;
        controls.minDistance = 3.2;
        controls.maxDistance = innerRadius;
      } else {
        // 360 look-around from the seat, camera stays in place
        controls.enableZoom = false;
        controls.minDistance = 0.01;
        controls.maxDistance = 0.04;
      }
    };

    setOverviewLimits(true);
    camera.position.set(hallCenter.x, hallCenter.y + 1.1, hallCenter.z + innerRadius * 0.55);
    controls.target.copy(hallCenter);
    controls.update();

    const seatMap = new Map();
    const seatMeshes = [];
    const disposableTextures = [];
    const labelSprites = [];

    const box = (w, h, d, material) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    const rounded = (w, h, d, radius = 0.1) => new RoundedBoxGeometry(w, h, d, 4, radius);

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8924a,
      metalness: 0.72,
      roughness: 0.32,
    });

    scene.add(new THREE.AmbientLight(0xfff4ea, 0.26));
    scene.add(new THREE.HemisphereLight(0x8ea0ff, 0x1a0c12, 0.4));

    const screenGlow = new THREE.PointLight(0x9eb8ff, 42, 38, 1.55);
    screenGlow.position.set(0, 6.2, 2.4);
    scene.add(screenGlow);

    const screenSpot = new THREE.SpotLight(0xffffff, 32, 42, 0.5, 0.5, 1.2);
    screenSpot.position.set(0, 10.6, orchestraLastZ + 2);
    screenSpot.target.position.set(0, SCREEN_Y, 0);
    scene.add(screenSpot);
    scene.add(screenSpot.target);

    const warmRear = new THREE.PointLight(0xff5a7a, 14, 28, 1.7);
    warmRear.position.set(0, BALCONY_Y + 3.2, lastRowZ);
    scene.add(warmRear);

    [-7, 7].forEach((x) => {
      const sconce = new THREE.PointLight(0xffc27a, 5, 16, 1.8);
      sconce.position.set(x, 5.6, orchestraLastZ * 0.5);
      scene.add(sconce);
    });

    const floor = box(
      roomWidth + 0.6,
      0.4,
      hallDepth + 1,
      new THREE.MeshStandardMaterial({ color: 0x120e14, roughness: 0.96 })
    );
    floor.position.set(0, -0.28, (frontZ + rearZ) / 2);
    scene.add(floor);

    const carpetCanvas = document.createElement("canvas");
    carpetCanvas.width = 512;
    carpetCanvas.height = 512;
    const carpetCtx = carpetCanvas.getContext("2d");
    carpetCtx.fillStyle = "#2a1520";
    carpetCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i += 1) {
      carpetCtx.fillStyle = Math.random() > 0.5 ? "rgba(255,220,180,.04)" : "rgba(0,0,0,.1)";
      carpetCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const carpetTexture = new THREE.CanvasTexture(carpetCanvas);
    carpetTexture.colorSpace = THREE.SRGBColorSpace;
    carpetTexture.wrapS = carpetTexture.wrapT = THREE.RepeatWrapping;
    carpetTexture.repeat.set(3, 5);
    disposableTextures.push(carpetTexture);

    const carpet = box(
      roomWidth - 1.1,
      0.04,
      hallDepth - 1.5,
      new THREE.MeshStandardMaterial({ map: carpetTexture, roughness: 1 })
    );
    carpet.position.set(0, -0.05, (frontZ + rearZ) / 2 + 0.4);
    scene.add(carpet);

    const aisleRunner = box(
      AISLE_WIDTH * 0.72,
      0.045,
      orchestraLastZ + 4,
      new THREE.MeshStandardMaterial({ color: 0x4a1d2d, roughness: 0.85 })
    );
    aisleRunner.position.set(0, -0.02, (orchestraLastZ + 2) / 2);
    scene.add(aisleRunner);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1319, roughness: 0.92 });
    [-1, 1].forEach((side) => {
      const wall = box(0.55, ceilingY, hallDepth + 1.2, wallMaterial);
      wall.position.set(side * (roomWidth / 2), ceilingY / 2 - 0.2, (frontZ + rearZ) / 2);
      scene.add(wall);
    });

    const rearWall = box(roomWidth + 0.8, ceilingY, 0.55, wallMaterial);
    rearWall.position.set(0, ceilingY / 2 - 0.2, rearZ);
    scene.add(rearWall);

    const stageWall = box(roomWidth + 0.8, ceilingY, 0.5, wallMaterial);
    stageWall.position.set(0, ceilingY / 2 - 0.2, frontZ);
    scene.add(stageWall);

    const ceiling = box(
      roomWidth + 0.8,
      0.32,
      hallDepth + 1.2,
      new THREE.MeshStandardMaterial({ color: 0x141018, roughness: 0.9 })
    );
    ceiling.position.set(0, ceilingY, (frontZ + rearZ) / 2);
    scene.add(ceiling);

    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2434, roughness: 0.78 });
    for (let z = 2.2; z < rearZ - 1.5; z += 3.1) {
      [-1, 1].forEach((side) => {
        const panel = box(0.16, 3.8, 1.9, panelMaterial);
        panel.position.set(side * (roomWidth / 2 - 0.38), 4.4, z);
        scene.add(panel);
        const trim = box(0.05, 3.9, 1.98, goldMaterial);
        trim.position.set(side * (roomWidth / 2 - 0.48), 4.4, z);
        scene.add(trim);
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffd7a0 })
        );
        lamp.position.set(side * (roomWidth / 2 - 0.62), 6.6, z);
        scene.add(lamp);
      });
    }

    for (let z = 2.4; z < rearZ - 1; z += 3.4) {
      for (let x = -roomWidth / 2 + 3; x < roomWidth / 2 - 2; x += 3.6) {
        const downlight = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20),
          new THREE.MeshBasicMaterial({ color: 0xffe1b0 })
        );
        downlight.position.set(x, ceilingY - 0.22, z);
        scene.add(downlight);
      }
    }

    const brandValance = makeBrandTexture({
      text: "CINEHUB",
      sub: "PREMIERE HALL",
      width: 1600,
      height: 280,
    });
    const brandWall = makeBrandTexture({
      text: "CINEHUB",
      sub: "LUXURY CINEMA",
      width: 1024,
      height: 320,
      bg: "#120c12",
    });
    const brandNeon = makeBrandTexture({
      text: "CINEHUB",
      width: 1024,
      height: 220,
      bg: "#09060a",
      fg: "#ffd7a0",
    });
    const brandRear = makeBrandTexture({
      text: "CINEHUB",
      sub: "BALCONY LOUNGE",
      width: 1400,
      height: 400,
    });
    disposableTextures.push(brandValance, brandWall, brandNeon, brandRear);

    const addBrandPlane = (texture, w, h, x, y, z, rotY = 0) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, fog: false })
      );
      mesh.position.set(x, y, z);
      mesh.rotation.y = rotY;
      scene.add(mesh);
      return mesh;
    };

    addBrandPlane(brandValance, SCREEN_W + 4.6, 1.05, 0, SCREEN_Y + SCREEN_H / 2 + 1.05, 0.22);
    addBrandPlane(brandWall, 4.6, 1.45, -roomWidth / 2 + 0.62, 8.35, orchestraLastZ * 0.42, Math.PI / 2);
    addBrandPlane(brandWall, 4.6, 1.45, roomWidth / 2 - 0.62, 8.35, orchestraLastZ * 0.42, -Math.PI / 2);
    addBrandPlane(brandNeon, 3.8, 0.85, -roomWidth / 2 + 0.62, 8.35, balconyFirstZ, Math.PI / 2);
    addBrandPlane(brandNeon, 3.8, 0.85, roomWidth / 2 - 0.62, 8.35, balconyFirstZ, -Math.PI / 2);
    addBrandPlane(brandRear, 8.4, 2.3, 0, BALCONY_Y + 4.4, rearZ - 0.32);

    const proscenium = box(
      SCREEN_W + 3.4,
      SCREEN_H + 2.4,
      0.55,
      new THREE.MeshStandardMaterial({ color: 0x1a1016, metalness: 0.2, roughness: 0.5 })
    );
    proscenium.position.set(0, SCREEN_Y, -0.55);
    scene.add(proscenium);

    const innerFrame = box(SCREEN_W + 0.55, SCREEN_H + 0.55, 0.2, goldMaterial);
    innerFrame.position.set(0, SCREEN_Y, -0.28);
    scene.add(innerFrame);

    [-1, 1].forEach((side) => {
      const curtain = box(
        2.4,
        SCREEN_H + 2.8,
        0.18,
        new THREE.MeshStandardMaterial({ color: 0x6a1630, roughness: 0.88 })
      );
      curtain.position.set(side * (SCREEN_W / 2 + 2.1), SCREEN_Y - 0.2, 0.15);
      curtain.rotation.y = side * -0.18;
      scene.add(curtain);
    });

    let placeholderTexture = makePlaceholderTexture(latestRef.current.movieTitle);
    disposableTextures.push(placeholderTexture);

    const videoElement = document.createElement("video");
    videoElement.crossOrigin = "anonymous";
    videoElement.preload = "metadata";
    videoElement.playsInline = true;
    videoElement.controls = false;
    videoElement.loop = false;
    videoElement.muted = false;
    videoElement.volume = 1;

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
    disposableTextures.push(videoTexture);

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: placeholderTexture,
      toneMapped: false,
      fog: false,
    });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMaterial);
    screenMesh.position.set(0, SCREEN_Y, SCREEN_Z);
    screenMesh.userData.isCinemaScreen = true;
    scene.add(screenMesh);

    const PX_PER_UNIT = 100;
    const cssScene = new THREE.Scene();
    const ytWrapper = document.createElement("div");
    ytWrapper.style.width = `${SCREEN_W * PX_PER_UNIT}px`;
    ytWrapper.style.height = `${SCREEN_H * PX_PER_UNIT}px`;
    ytWrapper.style.background = "#000";
    ytWrapper.style.display = "none";
    const ytFrame = document.createElement("iframe");
    ytFrame.style.cssText = "width:100%;height:100%;border:0;";
    ytFrame.title = "Movie trailer";
    ytFrame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    ytFrame.referrerPolicy = "strict-origin-when-cross-origin";
    ytWrapper.appendChild(ytFrame);
    const cssObject = new CSS3DObject(ytWrapper);
    cssObject.position.set(0, SCREEN_Y, SCREEN_Z);
    cssObject.scale.setScalar(1 / PX_PER_UNIT);
    cssScene.add(cssObject);

    const holeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        transparent: true,
        blending: THREE.NoBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: false,
      })
    );
    holeMesh.position.set(0, SCREEN_Y, SCREEN_Z);
    holeMesh.visible = false;
    scene.add(holeMesh);

    let playing = false;

    function updatePlaceholder(title) {
      const nextTexture = makePlaceholderTexture(title);
      const oldTexture = placeholderTexture;
      placeholderTexture = nextTexture;
      disposableTextures.push(nextTexture);
      if (screenMaterial.map !== videoTexture) {
        screenMaterial.map = nextTexture;
        screenMaterial.needsUpdate = true;
      }
      oldTexture.dispose();
    }

    function stopTrailer() {
      videoElement.pause();
      videoElement.removeAttribute("src");
      videoElement.load();
      ytFrame.src = "about:blank";
      ytWrapper.style.display = "none";
      holeMesh.visible = false;
      screenMesh.visible = true;
      screenMaterial.map = placeholderTexture;
      screenMaterial.needsUpdate = true;
      playing = false;
      setVideoPlaying(false);
    }

    function loadTrailer(url) {
      stopTrailer();
      setVideoError("");
      if (!url || !isDirectVideoUrl(url)) return;
      videoElement.src = url;
      videoElement.load();
    }

    function playYoutube(id) {
      const origin = encodeURIComponent(window.location.origin);
      ytFrame.src =
        `https://www.youtube.com/embed/${id}` +
        `?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=${origin}`;
      ytWrapper.style.display = "block";
      screenMesh.visible = false;
      holeMesh.visible = true;
      playing = true;
      setVideoPlaying(true);
      setVideoError("");
    }

    async function playTrailer() {
      const { videoUrl: url, youtubeId: ytId } = latestRef.current;
      if (ytId) {
        playYoutube(ytId);
        return;
      }
      if (!url || !isDirectVideoUrl(url)) {
        setVideoError("This movie needs a YouTube link or a direct MP4/WebM trailer URL.");
        return;
      }
      try {
        const absoluteUrl = new URL(url, window.location.href).href;
        if (videoElement.src !== absoluteUrl) loadTrailer(url);
        videoElement.muted = false;
        videoElement.volume = 1;
        await videoElement.play();
        screenMaterial.map = videoTexture;
        screenMaterial.needsUpdate = true;
        playing = true;
        setVideoPlaying(true);
        setVideoError("");
      } catch (error) {
        console.error("Trailer playback failed:", error);
        setVideoError("Could not play this video. Check the MP4 URL and the video host's CORS settings.");
      }
    }

    videoElement.addEventListener("ended", () => {
      playing = false;
      setVideoPlaying(false);
      screenMaterial.map = placeholderTexture;
      screenMaterial.needsUpdate = true;
    });
    videoElement.addEventListener("error", () => {
      if (!videoElement.getAttribute("src")) return;
      setVideoError("The video could not be loaded. Check that the URL points directly to an MP4/WebM file.");
    });

    const speakerMaterial = new THREE.MeshStandardMaterial({
      color: 0x14141a,
      roughness: 0.55,
      metalness: 0.28,
    });
    [-1, 1].forEach((side) => {
      const speaker = new THREE.Group();
      const cabinet = box(0.78, 4.2, 0.62, speakerMaterial);
      cabinet.position.y = 2.1;
      speaker.add(cabinet);
      speaker.position.set(side * (SCREEN_W / 2 + 3.15), 0, 0.45);
      scene.add(speaker);
    });

    function createSeat(label, rowIndex, columnIndex, options) {
      const { z, baseY, tier } = options;
      const seatColor = TIER_COLORS[tier] || TIER_COLORS.Standard;
      const isRecliner = tier === "Recliner";
      const group = new THREE.Group();

      const upholstery = new THREE.MeshStandardMaterial({
        color: seatColor,
        roughness: 0.72,
        metalness: 0.04,
      });

      const base = new THREE.Mesh(
        rounded(0.9, 0.3, 0.9, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x161218, roughness: 0.62, metalness: 0.18 })
      );
      base.position.set(0, 0.2, 0);
      group.add(base);

      const cushion = new THREE.Mesh(rounded(0.92, 0.26, 0.86, 0.14), upholstery.clone());
      cushion.position.set(0, 0.46, -0.02);
      cushion.userData.seatLabel = label;
      group.add(cushion);

      const backrest = new THREE.Mesh(rounded(0.92, 1.18, 0.32, 0.14), upholstery.clone());
      backrest.position.set(0, 1.08, 0.34);
      backrest.rotation.x = 0.12;
      backrest.userData.seatLabel = label;
      group.add(backrest);

      const headrest = new THREE.Mesh(rounded(0.66, 0.34, 0.26, 0.1), upholstery.clone());
      headrest.position.set(0, 1.72, 0.34);
      headrest.userData.seatLabel = label;
      group.add(headrest);

      [-1, 1].forEach((side) => {
        const armrest = new THREE.Mesh(
          rounded(0.18, 0.48, 0.86, 0.07),
          new THREE.MeshStandardMaterial({ color: 0x211c25, roughness: 0.62, metalness: 0.12 })
        );
        armrest.position.set(side * 0.56, 0.68, 0);
        group.add(armrest);
      });

      const footrest = new THREE.Mesh(
        rounded(0.8, 0.16, isRecliner ? 0.82 : 0.42, 0.08),
        upholstery.clone()
      );
      footrest.position.set(0, 0.3, isRecliner ? -0.68 : -0.52);
      footrest.userData.seatLabel = label;
      group.add(footrest);

      const labelTexture = makeSeatLabelTexture(label);
      disposableTextures.push(labelTexture);
      const labelSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: labelTexture,
          transparent: true,
          depthTest: true,
          sizeAttenuation: true,
          toneMapped: false,
        })
      );
      labelSprite.position.set(0, 2.05, 0.12);
      labelSprite.scale.set(0.62, 0.31, 1);
      labelSprite.userData.seatLabel = label;
      group.add(labelSprite);
      labelSprites.push(labelSprite);

      const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.16),
        new THREE.MeshBasicMaterial({ map: labelTexture, toneMapped: false, fog: false })
      );
      plate.position.set(0, 1.28, 0.52);
      plate.userData.seatLabel = label;
      group.add(plate);

      const columnX =
        (columnIndex - (seatCount - 1) / 2) * SEAT_GAP +
        (columnIndex >= seatCount / 2 ? AISLE_WIDTH / 2 : -AISLE_WIDTH / 2);

      group.position.set(columnX, baseY, z);
      group.userData.seatLabel = label;
      scene.add(group);

      const colorMeshes = [cushion, backrest, headrest, footrest];
      colorMeshes.forEach((mesh) => seatMeshes.push(mesh));
      seatMeshes.push(plate);

      seatMap.set(label, { group, baseY, tier, colorMeshes, labelSprite, labelTexture, plate });
    }

    function buildRow(row, rowIndex, z, platformY, riseForSeat) {
      const platform = box(
        totalSeatWidth + 2.2,
        0.46,
        1.55,
        new THREE.MeshStandardMaterial({
          color: rowIndex % 2 ? 0x241c27 : 0x1c161f,
          roughness: 0.9,
        })
      );
      platform.position.set(0, platformY, z);
      scene.add(platform);

      const stepLight = box(
        totalSeatWidth + 2.0,
        0.03,
        0.06,
        new THREE.MeshBasicMaterial({ color: 0xffc27a })
      );
      stepLight.position.set(0, platformY + 0.24, z - 0.78);
      scene.add(stepLight);

      const badgeTex = makeRowBadgeTexture(row);
      disposableTextures.push(badgeTex);
      [-1, 1].forEach((side) => {
        const badge = new THREE.Mesh(
          new THREE.CircleGeometry(0.22, 28),
          new THREE.MeshBasicMaterial({ map: badgeTex, toneMapped: false, fog: false })
        );
        badge.position.set(side * (totalSeatWidth / 2 + 0.85), platformY + 0.95, z);
        scene.add(badge);
      });

      for (let columnIndex = 0; columnIndex < seatCount; columnIndex += 1) {
        createSeat(`${row}${columnIndex + 1}`, rowIndex, columnIndex, {
          z,
          baseY: riseForSeat + 0.32,
          tier: tierName(row),
        });
      }
    }

    rows.forEach((row, rowIndex) => {
      buildRow(
        row,
        rowIndex,
        FIRST_ROW_Z + rowIndex * ROW_GAP,
        rowIndex * ROW_RISE,
        rowIndex * ROW_RISE
      );
    });

    if (balconyRows.length) {
      const balconyDepth = Math.max(4.8, balconyRows.length * BALCONY_ROW_GAP + 3.2);
      const deck = box(
        roomWidth - 1.6,
        0.42,
        balconyDepth,
        new THREE.MeshStandardMaterial({ color: 0x1a141c, roughness: 0.88 })
      );
      deck.position.set(0, BALCONY_Y - 0.22, balconyFirstZ + balconyDepth / 2 - 2.1);
      scene.add(deck);

      const fascia = box(
        roomWidth - 1.8,
        0.85,
        0.22,
        new THREE.MeshStandardMaterial({ color: 0x4a2434, roughness: 0.7 })
      );
      fascia.position.set(0, BALCONY_Y + 0.35, balconyFirstZ - 2.05);
      scene.add(fascia);

      const rail = box(roomWidth - 2.2, 0.08, 0.08, goldMaterial);
      rail.position.set(0, BALCONY_Y + 1.05, balconyFirstZ - 2.0);
      scene.add(rail);

      for (let x = -roomWidth / 2 + 3; x < roomWidth / 2 - 2; x += 1.1) {
        const baluster = box(0.05, 0.95, 0.05, goldMaterial);
        baluster.position.set(x, BALCONY_Y + 0.58, balconyFirstZ - 2.0);
        scene.add(baluster);
      }

      const fasciaBrand = addBrandPlane(
        brandNeon,
        6.2,
        0.55,
        0,
        BALCONY_Y + 0.38,
        balconyFirstZ - 1.92
      );
      fasciaBrand.scale.set(1, 1, 1);

      [-1, 1].forEach((side) => {
        const column = box(0.55, BALCONY_Y + 0.4, 0.55, wallMaterial);
        column.position.set(side * (totalSeatWidth / 2 + 1.6), (BALCONY_Y + 0.4) / 2, balconyFirstZ - 1.4);
        scene.add(column);
      });

      balconyRows.forEach((row, rowIndex) => {
        buildRow(
          row,
          rowIndex,
          balconyFirstZ + rowIndex * BALCONY_ROW_GAP,
          BALCONY_Y + rowIndex * BALCONY_RISE,
          BALCONY_Y + rowIndex * BALCONY_RISE
        );
      });
    }

    const defaultCameraPosition = new THREE.Vector3(
      hallCenter.x,
      hallCenter.y + 1.1,
      hallCenter.z + innerRadius * 0.55
    );
    const defaultTarget = hallCenter.clone();

    function keepCameraInside() {
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, bounds.minX, bounds.maxX);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, bounds.minY, bounds.maxY);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, bounds.minZ, bounds.maxZ);
    }

    function applyView(viewMode, selectedLabel) {
      const showLabels = viewMode !== "seat";
      labelSprites.forEach((sprite) => {
        sprite.visible = showLabels;
      });

      if (viewMode === "seat" && selectedLabel && seatMap.has(selectedLabel)) {
        const seat = seatMap.get(selectedLabel);
        const { x, z } = seat.group.position;
        setOverviewLimits(false);
        const eye = new THREE.Vector3(x, seat.baseY + 1.52, z + 0.02);
        const lookAt = new THREE.Vector3(x * 0.12, SCREEN_Y, 0);
        const direction = lookAt.clone().sub(eye).normalize();
        camera.position.copy(eye);
        controls.target.copy(eye).addScaledVector(direction, 0.02);
      } else {
        setOverviewLimits(true);
        camera.position.copy(defaultCameraPosition);
        controls.target.copy(defaultTarget);
      }
      keepCameraInside();
      controls.update();
    }

    applyView("cinema", null);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = null;
    let hoveredLabel = null;

    function getHit(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...seatMeshes, screenMesh], false);
      return hits[0]?.object || null;
    }

    function clearHover() {
      if (!hoveredLabel || !seatMap.has(hoveredLabel)) return;
      const seat = seatMap.get(hoveredLabel);
      const selected = latestRef.current.selectedSeats.includes(hoveredLabel);
      seat.colorMeshes.forEach((mesh) => {
        if (mesh.material.emissive) {
          mesh.material.emissive.setHex(selected ? 0x551020 : 0x000000);
        }
      });
      hoveredLabel = null;
    }

    function onPointerDown(event) {
      downPos = { x: event.clientX, y: event.clientY };
    }

    function onPointerMove(event) {
      const hit = getHit(event);
      const label = hit?.userData?.seatLabel || null;
      setHoveredSeat(label);
      if (label !== hoveredLabel) {
        clearHover();
        hoveredLabel = label;
        if (label && seatMap.has(label) && !latestRef.current.bookedSeats.includes(label)) {
          seatMap.get(label).colorMeshes.forEach((mesh) => {
            if (mesh.material.emissive) mesh.material.emissive.setHex(HOVER_EMISSIVE);
          });
        }
      }
      renderer.domElement.style.cursor =
        label || hit?.userData?.isCinemaScreen ? "pointer" : "grab";
    }

    function onPointerLeave() {
      setHoveredSeat(null);
      clearHover();
      renderer.domElement.style.cursor = "grab";
    }

    function onClick(event) {
      if (downPos && Math.hypot(event.clientX - downPos.x, event.clientY - downPos.y) > 6) return;
      const hit = getHit(event);
      if (!hit) return;
      if (hit.userData.isCinemaScreen) {
        if (!playing) playTrailer();
        return;
      }
      const label = hit.userData.seatLabel;
      if (!label || latestRef.current.disabled) return;
      if (latestRef.current.bookedSeats.includes(label)) return;
      latestRef.current.onToggleSeat?.(label);
    }

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerleave", onPointerLeave);
    dom.addEventListener("click", onClick);

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = mount.clientWidth;
      const nextHeight = mount.clientHeight;
      if (!nextWidth || !nextHeight) return;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      cssRenderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(mount);

    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      keepCameraInside();
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    }
    animate();

    sceneRef.current = {
      scene,
      camera,
      controls,
      renderer,
      seatMap,
      playTrailer,
      stopTrailer,
      loadTrailer,
      applyView,
      updatePlaceholder,
    };

    if (latestRef.current.videoUrl && isDirectVideoUrl(latestRef.current.videoUrl)) {
      loadTrailer(latestRef.current.videoUrl);
    }

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerleave", onPointerLeave);
      dom.removeEventListener("click", onClick);
      videoElement.pause();
      videoElement.removeAttribute("src");
      videoElement.load();
      ytFrame.src = "about:blank";
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      disposableTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      if (cssRenderer.domElement.parentNode === mount) mount.removeChild(cssRenderer.domElement);
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsKey, balconyKey, seatsPerRow]);

  useEffect(() => {
    const current = sceneRef.current;
    if (!current) return;
    current.stopTrailer();
    if (videoUrl && isDirectVideoUrl(videoUrl)) {
      current.loadTrailer(videoUrl);
      setVideoError("");
    } else if (youtubeId) setVideoError("");
    else if (videoUrl) {
      setVideoError("This trailer link isn't supported. Use a YouTube link or a direct MP4/WebM URL.");
    } else setVideoError("No trailer URL is available for this movie.");
  }, [videoUrl, youtubeId]);

  useEffect(() => {
    sceneRef.current?.updatePlaceholder(movieTitle);
  }, [movieTitle]);

  useEffect(() => {
    const current = sceneRef.current;
    if (!current) return;
    current.seatMap.forEach((seat, label) => {
      const isBooked = bookedSeats.includes(label);
      const isSelected = selectedSeats.includes(label);
      const color = isBooked
        ? BOOKED_COLOR
        : isSelected
          ? SELECTED_COLOR
          : TIER_COLORS[seat.tier] || TIER_COLORS.Standard;
      seat.colorMeshes.forEach((mesh) => {
        mesh.material.color.setHex(color);
        if (mesh.material.emissive) mesh.material.emissive.setHex(isSelected ? 0x551020 : 0x000000);
      });
      const next = makeSeatLabelTexture(label, isSelected, isBooked);
      const old = seat.labelTexture;
      seat.labelTexture = next;
      if (seat.labelSprite?.material) {
        seat.labelSprite.material.map = next;
        seat.labelSprite.material.needsUpdate = true;
      }
      if (seat.plate?.material) {
        seat.plate.material.map = next;
        seat.plate.material.needsUpdate = true;
      }
      old?.dispose();
    });
  }, [bookedSeats, selectedSeats]);

  useEffect(() => {
    sceneRef.current?.applyView(mode, lastSelected);
  }, [mode, lastSelected]);

  useEffect(() => {
    if (mode === "seat" && !lastSelected) setMode("cinema");
  }, [mode, lastSelected]);

  const startTrailer = () => {
    const current = sceneRef.current;
    if (!canPlay || !current) {
      setVideoError("Add a YouTube link or a direct MP4/WebM trailer URL to this movie.");
      return;
    }
    current.playTrailer();
  };

  const hoveredPrice = hoveredSeat && getSeatPrice ? getSeatPrice(hoveredSeat) : null;

  return (
    <section className={`t3d${isFullscreen ? " t3d-fullscreen" : ""}`} ref={theatreRef}>
      <div className="t3d-header">
        <div>
          <h3>CineHub Premiere Hall</h3>
          <p>{movieTitle}</p>
        </div>
        <div className="t3d-status">
          <span className="t3d-status-dot" />
          Orchestra + balcony
        </div>
      </div>

      <div className="t3d-toolbar">
        <button type="button" className={mode === "cinema" ? "active" : ""} onClick={() => setMode("cinema")}>
          Auditorium view
        </button>
        <button
          type="button"
          className={mode === "seat" ? "active" : ""}
          onClick={() => setMode("seat")}
          disabled={!lastSelected}
        >
          My seat
        </button>
        <button type="button" onClick={startTrailer} disabled={!canPlay}>
          {videoPlaying ? "Playing trailer" : "Play trailer"}
        </button>
        <button type="button" onClick={() => sceneRef.current?.stopTrailer()} disabled={!videoPlaying}>
          Stop trailer
        </button>
        <button type="button" onClick={toggleFullscreen}>
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>

      <div className="t3d-stage">
        <div className="t3d-canvas" ref={mountRef} />
        <div className="t3d-screen-hint">
          {videoPlaying
            ? "Playing on the cinema screen · use Stop trailer to end it"
            : canPlay
              ? "Click the cinema screen or Play trailer to watch"
              : "Add a YouTube or MP4 trailer URL to this movie"}
        </div>
      </div>

      {videoError && (
        <p className="t3d-video-error" role="status">
          {videoError}
        </p>
      )}

      <div className="t3d-hint">
        {mode === "seat"
          ? "Look around from your seat · the camera stays inside the hall"
          : "Camera stays inside CineHub hall · drag to look · zoom gently · click a numbered seat"}
        {hoveredSeat ? ` · Seat ${hoveredSeat}${hoveredPrice != null ? ` · ₹${hoveredPrice}` : ""}` : ""}
      </div>

      <div className="t3d-legend">
        <span><i className="standard" />Standard</span>
        <span><i className="premium" />Premium</span>
        <span><i className="recliner" />Recliner</span>
        <span><i className="balcony" />Balcony</span>
        <span><i className="selected" />Selected</span>
        <span><i className="booked" />Booked</span>
      </div>

      <div className="t3d-info">
        <div>
          <small>Selected seats</small>
          <strong>{selectedSeats.length ? selectedSeats.join(", ") : "None"}</strong>
        </div>
        <div>
          <small>Total seats</small>
          <strong>{selectedSeats.length}</strong>
        </div>
        <div>
          <small>Trailer</small>
          <strong>{hasVideo ? "MP4/WebM available" : youtubeId ? "YouTube available" : "Not available"}</strong>
        </div>
      </div>
    </section>
  );
}