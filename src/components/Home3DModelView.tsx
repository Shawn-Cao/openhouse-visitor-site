import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PropertyListing } from '../types';
import { 
  Box, 
  Layers, 
  Sun, 
  Moon, 
  Sunset, 
  RotateCw, 
  UploadCloud, 
  Maximize2, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  Ruler, 
  Eye, 
  Compass, 
  FileCode2, 
  HelpCircle,
  Camera,
  Play,
  RotateCcw,
  Sliders,
  Link,
  Code,
  FolderOpen,
  X,
  ExternalLink,
  Download,
  Check
} from 'lucide-react';

interface Home3DModelViewProps {
  listing: PropertyListing;
  onSelectRoomTour?: (roomId: string) => void;
  onBookShowing?: () => void;
}

type RenderMode = 'pbr' | 'clay' | 'wireframe';
type FloorLevel = 'all' | 'level1' | 'level2' | 'roof' | 'exploded';

interface RoomWaypoint {
  id: string;
  name: string;
  roomRefId?: string;
  position: [number, number, number];
  target: [number, number, number];
  sqft: number;
  highlight: string;
}

interface PresetModel {
  id: string;
  name: string;
  description: string;
  url?: string;
  isProcedural?: boolean;
  type: 'villa' | 'gltf' | 'obj';
}

const PRESET_MODELS: PresetModel[] = [
  {
    id: 'procedural-twin',
    name: '428 Crestview Ridge Twin',
    description: 'Custom 4,120 sq ft architectural digital twin with pool, solar array & interior zoning',
    isProcedural: true,
    type: 'villa'
  },
  {
    id: 'sample-modern-house',
    name: 'Modern Pavilion House (GLB)',
    description: 'Khronos open-standard glTF binary model with detailed textures',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/House/glTF-Binary/House.glb',
    type: 'gltf'
  },
  {
    id: 'sample-lantern-pavilion',
    name: 'Architectural Lantern Villa (GLB)',
    description: 'PBR materials showcase model with glass & structural wood',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb',
    type: 'gltf'
  }
];

const ROOM_WAYPOINTS: RoomWaypoint[] = [
  {
    id: 'great-room',
    name: 'Great Room & Fleetwood Glass',
    roomRefId: 'living-room',
    position: [0, 8, 18],
    target: [0, 2, 0],
    sqft: 980,
    highlight: '12ft ceilings, 28ft automated Fleetwood pocket glass doors'
  },
  {
    id: 'chef-kitchen',
    name: 'Gourmet Kitchen & Quartzite Island',
    roomRefId: 'kitchen',
    position: [-10, 7, 10],
    target: [-6, 2, -2],
    sqft: 650,
    highlight: '14ft Taj Mahal quartzite waterfall island, Sub-Zero & Wolf suite'
  },
  {
    id: 'primary-suite',
    name: 'Primary Suite & Spa Balcony',
    roomRefId: 'primary-suite',
    position: [8, 16, 12],
    target: [6, 9, 2],
    sqft: 820,
    highlight: 'Upper level private sanctuary with panoramic canyon views'
  },
  {
    id: 'pool-terrace',
    name: 'Infinity Plunge Pool & Deck',
    roomRefId: 'backyard',
    position: [0, 10, -22],
    target: [0, 1, -8],
    sqft: 1400,
    highlight: '40ft zero-edge heated saltwater plunge pool & outdoor kitchen'
  },
  {
    id: 'wine-vault',
    name: '450-Bottle Climate Wine Vault',
    roomRefId: 'wine-cellar',
    position: [12, 6, -4],
    target: [8, 2, -4],
    sqft: 180,
    highlight: 'Triple-glazed frameless glass enclosure with walnut racking'
  }
];

export const Home3DModelView: React.FC<Home3DModelViewProps> = ({
  listing,
  onSelectRoomTour,
  onBookShowing
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const userModelRef = useRef<THREE.Object3D | null>(null);
  const floor1GroupRef = useRef<THREE.Group | null>(null);
  const floor2GroupRef = useRef<THREE.Group | null>(null);
  const roofGroupRef = useRef<THREE.Group | null>(null);
  const outdoorGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);

  // UI Interactive States
  const [renderMode, setRenderMode] = useState<RenderMode>('pbr');
  const [floorLevel, setFloorLevel] = useState<FloorLevel>('all');
  const [explodedGap, setExplodedGap] = useState<number>(0);
  const [timeOfDay, setTimeOfDay] = useState<number>(16); // 16 = 4:00 PM Golden Hour
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showFormatGuide, setShowFormatGuide] = useState<boolean>(false);
  const [isCustomModelLoaded, setIsCustomModelLoaded] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('procedural-twin');
  
  // Modals for loading models
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets' | 'paste'>('upload');
  const [urlInput, setUrlInput] = useState<string>('');
  const [pasteInput, setPasteInput] = useState<string>('');
  const [pasteFormat, setPasteFormat] = useState<'gltf' | 'obj'>('gltf');

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a09); // Stone-950
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(24, 18, 30);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 6;
    controls.maxDistance = 90;
    controls.target.set(0, 4, 0);
    controlsRef.current = controls;

    // 5. Lights
    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x1c1917, 0.85);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff1db, 2.2);
    dirLight.position.set(28, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Soft Fill light
    const fillLight = new THREE.DirectionalLight(0x88aacc, 0.4);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // Warm Interior Ambient Points
    const warmPoint1 = new THREE.PointLight(0xffaa44, 2.0, 15);
    warmPoint1.position.set(0, 4, 0);
    scene.add(warmPoint1);

    const warmPoint2 = new THREE.PointLight(0xffaa44, 2.0, 15);
    warmPoint2.position.set(5, 10, 2);
    scene.add(warmPoint2);

    // 6. Build the Procedural Modern Architecture Model
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    buildArchitecturalHomeModel(modelGroup);

    // 7. Ground / Terrain Grid
    const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x171513,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle Architectural Grid lines
    const gridHelper = new THREE.GridHelper(80, 40, 0x44403c, 0x292524);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate pool water shimmer
      if (waterMeshRef.current) {
        const mat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.roughness = 0.1 + Math.sin(elapsedTime * 2.5) * 0.05;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 580;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // Helper function to build the procedural architectural villa
  const buildArchitecturalHomeModel = (parentGroup: THREE.Group) => {
    // Shared Materials
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1, // Light warm stone
      roughness: 0.75,
      metalness: 0.05
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x292524, // Charcoal zinc
      roughness: 0.4,
      metalness: 0.3
    });

    const woodPlankMat = new THREE.MeshStandardMaterial({
      color: 0x9a7b56, // European White Oak / Teak deck
      roughness: 0.6,
      metalness: 0.05
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xebf8ff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.75,
      ior: 1.5,
      reflectivity: 0.8
    });

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.82
    });

    const poolTileMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.2
    });

    // --- LEVEL 1: GROUND FLOOR (Great Room, Chef Kitchen, Wine Vault, Garage) ---
    const f1Group = new THREE.Group();
    floor1GroupRef.current = f1Group;
    parentGroup.add(f1Group);

    // Foundation Slab & Teak Hardwood floor
    const f1FloorGeo = new THREE.BoxGeometry(26, 0.4, 18);
    const f1Floor = new THREE.Mesh(f1FloorGeo, woodPlankMat);
    f1Floor.position.set(0, 0.2, 0);
    f1Floor.receiveShadow = true;
    f1Group.add(f1Floor);

    // Main Great Room Back Wall (Concrete finish)
    const backWallGeo = new THREE.BoxGeometry(26, 5.5, 0.6);
    const backWall = new THREE.Mesh(backWallGeo, concreteMat);
    backWall.position.set(0, 3.0, -9);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    f1Group.add(backWall);

    // Left Wall (Kitchen & Pantry)
    const leftWallGeo = new THREE.BoxGeometry(0.6, 5.5, 18);
    const leftWall = new THREE.Mesh(leftWallGeo, concreteMat);
    leftWall.position.set(-13, 3.0, 0);
    leftWall.castShadow = true;
    f1Group.add(leftWall);

    // Right Wall (Wine Vault & Garage Partition)
    const rightWallGeo = new THREE.BoxGeometry(0.6, 5.5, 18);
    const rightWall = new THREE.Mesh(rightWallGeo, darkAccentMat);
    rightWall.position.set(13, 3.0, 0);
    rightWall.castShadow = true;
    f1Group.add(rightWall);

    // Fleetwood Pocket Glass Front Wall (Facing Pool / View)
    const glassWallGeo = new THREE.BoxGeometry(24, 5.2, 0.15);
    const frontGlass = new THREE.Mesh(glassWallGeo, glassMat);
    frontGlass.position.set(0, 2.9, 9);
    frontGlass.castShadow = true;
    f1Group.add(frontGlass);

    // Slim Architectural Mullions
    for (let x = -10; x <= 10; x += 5) {
      const mullionGeo = new THREE.BoxGeometry(0.2, 5.5, 0.25);
      const mullion = new THREE.Mesh(mullionGeo, darkAccentMat);
      mullion.position.set(x, 3.0, 9);
      f1Group.add(mullion);
    }

    // Gourmet Kitchen Taj Mahal Quartzite Island (14ft)
    const islandGeo = new THREE.BoxGeometry(7, 1.8, 2.8);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f4,
      roughness: 0.15,
      metalness: 0.05
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(-7.5, 1.1, 1);
    island.castShadow = true;
    island.receiveShadow = true;
    f1Group.add(island);

    // Great Room Custom Italian Sofa
    const sofaGeo = new THREE.BoxGeometry(6, 1.2, 2.5);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 });
    const sofa = new THREE.Mesh(sofaGeo, sofaMat);
    sofa.position.set(4, 0.8, 2);
    sofa.castShadow = true;
    f1Group.add(sofa);

    // Marble Coffee Table
    const coffeeTableGeo = new THREE.BoxGeometry(3.5, 0.6, 1.8);
    const coffeeTable = new THREE.Mesh(coffeeTableGeo, concreteMat);
    coffeeTable.position.set(4, 0.5, 4.5);
    f1Group.add(coffeeTable);

    // Wine Cellar Glass Enclosure
    const wineGlassGeo = new THREE.BoxGeometry(4, 5.2, 4);
    const wineGlass = new THREE.Mesh(wineGlassGeo, glassMat);
    wineGlass.position.set(9.5, 2.8, -5.5);
    f1Group.add(wineGlass);

    // --- LEVEL 2: UPPER FLOOR (Primary Sanctuary, Spa Bath, Guest Suites, Cantilevered Balcony) ---
    const f2Group = new THREE.Group();
    floor2GroupRef.current = f2Group;
    parentGroup.add(f2Group);

    // Level 2 Floor Slab (Inter-floor separation)
    const f2FloorGeo = new THREE.BoxGeometry(28, 0.6, 20);
    const f2Floor = new THREE.Mesh(f2FloorGeo, concreteMat);
    f2Floor.position.set(1, 6.0, 0);
    f2Floor.castShadow = true;
    f2Floor.receiveShadow = true;
    f2Group.add(f2Floor);

    // Cantilevered Upper Master Wing (Extends out over terrace)
    const masterWingGeo = new THREE.BoxGeometry(16, 5.0, 16);
    const masterWing = new THREE.Mesh(masterWingGeo, concreteMat);
    masterWing.position.set(4, 8.8, 1);
    masterWing.castShadow = true;
    masterWing.receiveShadow = true;
    f2Group.add(masterWing);

    // Master Bedroom Glass Corner View
    const cornerGlassGeo = new THREE.BoxGeometry(10, 4.5, 0.15);
    const cornerGlass = new THREE.Mesh(cornerGlassGeo, glassMat);
    cornerGlass.position.set(4, 8.8, 9.1);
    f2Group.add(cornerGlass);

    // Master King Platform Bed
    const bedGeo = new THREE.BoxGeometry(4.5, 1.2, 4.5);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(5.5, 6.9, 0);
    f2Group.add(bed);

    // Upper Balcony Glass Railing
    const balconyRailingGeo = new THREE.BoxGeometry(18, 1.8, 0.1);
    const balconyRailing = new THREE.Mesh(balconyRailingGeo, glassMat);
    balconyRailing.position.set(3, 7.2, 10.2);
    f2Group.add(balconyRailing);

    // --- ROOF & SOLAR ARRAY ---
    const roofGroup = new THREE.Group();
    roofGroupRef.current = roofGroup;
    parentGroup.add(roofGroup);

    // Cantilevered Flat Modern Roof with Overhang
    const roofSlabGeo = new THREE.BoxGeometry(32, 0.5, 24);
    const roofSlab = new THREE.Mesh(roofSlabGeo, darkAccentMat);
    roofSlab.position.set(1, 11.6, 0);
    roofSlab.castShadow = true;
    roofGroup.add(roofSlab);

    // Solar Panel Array Grid on Roof
    for (let r = -8; r <= 8; r += 4) {
      for (let c = -6; c <= 6; c += 3) {
        const solarGeo = new THREE.BoxGeometry(3.2, 0.08, 2.2);
        const solarMat = new THREE.MeshStandardMaterial({
          color: 0x1e1b4b, // Deep indigo silicon
          roughness: 0.1,
          metalness: 0.8
        });
        const solar = new THREE.Mesh(solarGeo, solarMat);
        solar.position.set(r, 11.9, c);
        solar.rotation.x = -0.12; // 7-degree solar tilt
        roofGroup.add(solar);
      }
    }

    // --- OUTDOOR LIVING & POOL DECK ---
    const outdoorGroup = new THREE.Group();
    outdoorGroupRef.current = outdoorGroup;
    parentGroup.add(outdoorGroup);

    // Teak Sun Deck
    const deckGeo = new THREE.BoxGeometry(32, 0.3, 14);
    const deck = new THREE.Mesh(deckGeo, woodPlankMat);
    deck.position.set(0, 0.15, -16);
    deck.receiveShadow = true;
    outdoorGroup.add(deck);

    // Heated Saltwater Zero-Edge Plunge Pool Structure
    const poolBasinGeo = new THREE.BoxGeometry(18, 1.8, 7);
    const poolBasin = new THREE.Mesh(poolBasinGeo, poolTileMat);
    poolBasin.position.set(0, -0.6, -16);
    outdoorGroup.add(poolBasin);

    // Pool Water Surface
    const waterGeo = new THREE.PlaneGeometry(17.4, 6.4);
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.1, -16);
    waterMeshRef.current = water;
    outdoorGroup.add(water);

    // Chaise Lounges by Pool
    for (let lx = -6; lx <= 6; lx += 4) {
      const loungeGeo = new THREE.BoxGeometry(1.6, 0.4, 3.6);
      const loungeMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.7 });
      const lounge = new THREE.Mesh(loungeGeo, loungeMat);
      lounge.position.set(lx, 0.4, -11.5);
      lounge.castShadow = true;
      outdoorGroup.add(lounge);
    }

    // Modern Architectural Perimeter Planters & Trees
    const planterGeo = new THREE.BoxGeometry(2, 1.2, 2);
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x44403c });
    
    [
      [-15, 0.6, -12],
      [15, 0.6, -12],
      [-15, 0.6, 8],
      [15, 0.6, 8]
    ].forEach(([px, py, pz]) => {
      const planter = new THREE.Mesh(planterGeo, planterMat);
      planter.position.set(px, py, pz);
      outdoorGroup.add(planter);

      // Stylized Olive Tree Trunk & Canopy
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 3.5, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x573d26 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(px, py + 2.2, pz);
      outdoorGroup.add(trunk);

      const canopyGeo = new THREE.DodecahedronGeometry(1.8, 1);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x3f6212, // Olive foliage
        roughness: 0.9
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(px, py + 4.2, pz);
      canopy.castShadow = true;
      outdoorGroup.add(canopy);
    });
  };

  // Handle Floor Explode / Cutaway Animation
  useEffect(() => {
    if (!floor1GroupRef.current || !floor2GroupRef.current || !roofGroupRef.current) return;

    if (floorLevel === 'all') {
      floor1GroupRef.current.visible = true;
      floor2GroupRef.current.visible = true;
      roofGroupRef.current.visible = true;
      floor2GroupRef.current.position.y = 0;
      roofGroupRef.current.position.y = 0;
    } else if (floorLevel === 'level1') {
      floor1GroupRef.current.visible = true;
      floor2GroupRef.current.visible = false;
      roofGroupRef.current.visible = false;
    } else if (floorLevel === 'level2') {
      floor1GroupRef.current.visible = true;
      floor2GroupRef.current.visible = true;
      roofGroupRef.current.visible = false;
      floor2GroupRef.current.position.y = 0;
    } else if (floorLevel === 'roof') {
      floor1GroupRef.current.visible = true;
      floor2GroupRef.current.visible = true;
      roofGroupRef.current.visible = true;
      floor2GroupRef.current.position.y = 0;
      roofGroupRef.current.position.y = 0;
    } else if (floorLevel === 'exploded') {
      floor1GroupRef.current.visible = true;
      floor2GroupRef.current.visible = true;
      roofGroupRef.current.visible = true;
      floor2GroupRef.current.position.y = 6.5 + (explodedGap * 0.1);
      roofGroupRef.current.position.y = 12.0 + (explodedGap * 0.18);
    }
  }, [floorLevel, explodedGap]);

  // Handle Time-of-Day and Lighting Adjustments
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current || !rendererRef.current) return;

    // Map 6 (6AM) to 21 (9PM)
    const hour = timeOfDay;
    const progress = (hour - 6) / 15; // 0 to 1
    const sunAngle = progress * Math.PI; // 0 to PI

    const sunX = Math.cos(sunAngle) * 45;
    const sunY = Math.sin(sunAngle) * 45;
    const sunZ = 20;

    dirLightRef.current.position.set(sunX, Math.max(sunY, 1.0), sunZ);

    if (hour >= 18) {
      // Twilight / Dusk / Evening
      sceneRef.current.background = new THREE.Color(0x060814);
      sceneRef.current.fog = new THREE.FogExp2(0x060814, 0.015);
      hemiLightRef.current.color.setHex(0x1e293b);
      hemiLightRef.current.groundColor.setHex(0x020617);
      hemiLightRef.current.intensity = 0.35;
      dirLightRef.current.color.setHex(0xf97316); // Warm orange dusk rim
      dirLightRef.current.intensity = 0.8;
      rendererRef.current.toneMappingExposure = 0.95;
    } else if (hour >= 15 && hour < 18) {
      // Golden Hour
      sceneRef.current.background = new THREE.Color(0x181310);
      sceneRef.current.fog = new THREE.FogExp2(0x181310, 0.012);
      hemiLightRef.current.color.setHex(0xfef3c7);
      hemiLightRef.current.groundColor.setHex(0x292524);
      hemiLightRef.current.intensity = 0.85;
      dirLightRef.current.color.setHex(0xfbbf24);
      dirLightRef.current.intensity = 2.4;
      rendererRef.current.toneMappingExposure = 1.15;
    } else {
      // Crisp Daylight (10am - 2pm)
      sceneRef.current.background = new THREE.Color(0x0c0a09);
      sceneRef.current.fog = new THREE.FogExp2(0x0c0a09, 0.012);
      hemiLightRef.current.color.setHex(0xffffff);
      hemiLightRef.current.groundColor.setHex(0x292524);
      hemiLightRef.current.intensity = 1.0;
      dirLightRef.current.color.setHex(0xfffbeb);
      dirLightRef.current.intensity = 2.5;
      rendererRef.current.toneMappingExposure = 1.1;
    }
  }, [timeOfDay]);

  // Handle Render Styles (PBR, Clay, Wireframe, X-Ray)
  useEffect(() => {
    if (!modelGroupRef.current && !userModelRef.current) return;

    const targetGroup = userModelRef.current || modelGroupRef.current;
    if (!targetGroup) return;

    targetGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (renderMode === 'wireframe') {
          child.material.wireframe = true;
        } else if (renderMode === 'clay') {
          child.material.wireframe = false;
          child.material.color = new THREE.Color(0xd6d3d1);
          child.material.roughness = 0.85;
          child.material.metalness = 0.0;
        } else {
          child.material.wireframe = false;
        }
      }
    });
  }, [renderMode]);

  // Handle Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  }, [autoRotate]);

  // Camera Fly-to Waypoint Handler
  const handleFlyToWaypoint = (waypoint: RoomWaypoint) => {
    setSelectedWaypoint(waypoint.id);
    if (!cameraRef.current || !controlsRef.current) return;

    const [px, py, pz] = waypoint.position;
    const [tx, ty, tz] = waypoint.target;

    const startPos = cameraRef.current.position.clone();
    const targetPos = new THREE.Vector3(px, py, pz);
    const startTarget = controlsRef.current.target.clone();
    const endTarget = new THREE.Vector3(tx, ty, tz);

    let progress = 0;
    const duration = 45; // frames

    const tweenCamera = () => {
      progress++;
      const t = progress / duration;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerpVectors(startPos, targetPos, ease);
        controlsRef.current.target.lerpVectors(startTarget, endTarget, ease);
        controlsRef.current.update();
      }

      if (progress < duration) {
        requestAnimationFrame(tweenCamera);
      }
    };
    tweenCamera();
  };

  // Reset Camera to Master Isometric View
  const handleResetCamera = () => {
    setSelectedWaypoint(null);
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(24, 18, 30);
    controlsRef.current.target.set(0, 4, 0);
    controlsRef.current.update();
  };

  // Helper: Auto-scale, center, and attach 3D Object to scene
  const attachCustomModelToScene = (model: THREE.Object3D, fileName: string) => {
    if (!sceneRef.current) return;
    
    // Hide procedural villa
    if (modelGroupRef.current) modelGroupRef.current.visible = false;
    // Remove old custom model
    if (userModelRef.current) sceneRef.current.remove(userModelRef.current);

    userModelRef.current = model;

    // Auto-scale and center model
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 26 / (maxDim || 1);
    model.scale.set(scale, scale, scale);

    model.position.x = -center.x * scale;
    model.position.y = -box.min.y * scale;
    model.position.z = -center.z * scale;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // If materials missing, give clean architectural material
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xe7e5e4,
            roughness: 0.5,
            metalness: 0.1
          });
        }
      }
    });

    sceneRef.current.add(model);
    setIsCustomModelLoaded(true);
    setCustomFileName(fileName);
    setLoadingModel(false);
    setModelError(null);
    setShowLoadModal(false);
    handleResetCamera();
  };

  // 1. Load from File Object (Local Machine Upload or Drop)
  const load3DFile = (file: File) => {
    setLoadingModel(true);
    setModelError(null);
    setCustomFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileUrl = URL.createObjectURL(file);

    if (ext === 'glb' || ext === 'gltf') {
      const loader = new GLTFLoader();
      loader.load(
        fileUrl,
        (gltf) => {
          attachCustomModelToScene(gltf.scene, file.name);
          URL.revokeObjectURL(fileUrl);
        },
        undefined,
        (err) => {
          console.error('Failed to load glTF/GLB file:', err);
          setModelError('Could not load .glb file. Please ensure it is a valid glTF 2.0 or GLB binary model.');
          setLoadingModel(false);
          URL.revokeObjectURL(fileUrl);
        }
      );
    } else if (ext === 'obj') {
      const loader = new OBJLoader();
      loader.load(
        fileUrl,
        (obj) => {
          attachCustomModelToScene(obj, file.name);
          URL.revokeObjectURL(fileUrl);
        },
        undefined,
        (err) => {
          console.error('Failed to load OBJ file:', err);
          setModelError('Could not parse .obj file. Please check file format.');
          setLoadingModel(false);
          URL.revokeObjectURL(fileUrl);
        }
      );
    } else {
      setModelError(`Unsupported format (.${ext}). Recommended: .glb (Binary glTF 2.0) or .gltf.`);
      setLoadingModel(false);
      URL.revokeObjectURL(fileUrl);
    }
  };

  // 2. Load from Public Direct URL (.glb, .gltf, .obj)
  const loadModelFromUrl = (url: string, displayName?: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setLoadingModel(true);
    setModelError(null);
    const resolvedName = displayName || trimmedUrl.split('/').pop()?.split('?')[0] || 'Remote 3D Model';
    setCustomFileName(resolvedName);

    const isObj = trimmedUrl.toLowerCase().includes('.obj');

    if (isObj) {
      const loader = new OBJLoader();
      loader.load(
        trimmedUrl,
        (obj) => {
          attachCustomModelToScene(obj, resolvedName);
        },
        undefined,
        (err) => {
          console.error('Failed to load OBJ from URL:', err);
          setModelError('Failed to fetch .obj from URL. Check that the URL is public and CORS-enabled.');
          setLoadingModel(false);
        }
      );
    } else {
      const loader = new GLTFLoader();
      loader.load(
        trimmedUrl,
        (gltf) => {
          attachCustomModelToScene(gltf.scene, resolvedName);
        },
        undefined,
        (err) => {
          console.error('Failed to load GLB/GLTF from URL:', err);
          setModelError('Failed to fetch 3D model from URL. Ensure the URL points to a direct public .glb file with CORS access.');
          setLoadingModel(false);
        }
      );
    }
  };

  // 3. Load from Raw Text / Base64 / glTF JSON / OBJ String
  const loadModelFromText = (rawContent: string, format: 'gltf' | 'obj') => {
    const content = rawContent.trim();
    if (!content) return;

    setLoadingModel(true);
    setModelError(null);
    setCustomFileName('Custom Text Model');

    try {
      if (format === 'obj') {
        const loader = new OBJLoader();
        const obj = loader.parse(content);
        attachCustomModelToScene(obj, 'Imported OBJ Model');
      } else {
        // glTF JSON or Base64
        if (content.startsWith('data:')) {
          // Data URI
          const loader = new GLTFLoader();
          loader.load(
            content,
            (gltf) => attachCustomModelToScene(gltf.scene, 'Data URI Model'),
            undefined,
            (err) => {
              setModelError('Failed to parse Base64 data URI.');
              setLoadingModel(false);
            }
          );
        } else {
          const loader = new GLTFLoader();
          loader.parse(
            content,
            '',
            (gltf) => attachCustomModelToScene(gltf.scene, 'Pasted glTF JSON'),
            (err) => {
              console.error('Failed to parse glTF JSON:', err);
              setModelError('Invalid glTF JSON schema. Ensure all required buffers are embedded or valid.');
              setLoadingModel(false);
            }
          );
        }
      }
    } catch (err: any) {
      console.error('Parse error:', err);
      setModelError(err?.message || 'Failed to parse 3D text data.');
      setLoadingModel(false);
    }
  };

  // 4. Select Preset Model
  const handleSelectPreset = (preset: PresetModel) => {
    setActivePreset(preset.id);
    if (preset.isProcedural) {
      handleResetToVillaModel();
      setShowLoadModal(false);
    } else if (preset.url) {
      loadModelFromUrl(preset.url, preset.name);
    }
  };

  // Handle User 3D File Upload (.glb, .gltf, .obj)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    load3DFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    load3DFile(file);
  };

  const handleResetToVillaModel = () => {
    if (userModelRef.current && sceneRef.current) {
      sceneRef.current.remove(userModelRef.current);
      userModelRef.current = null;
    }
    if (modelGroupRef.current) {
      modelGroupRef.current.visible = true;
    }
    setIsCustomModelLoaded(false);
    setCustomFileName('');
    setModelError(null);
    setActivePreset('procedural-twin');
    handleResetCamera();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 3D Model View Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Box className="w-4 h-4" />
            <span>Interactive 3D Architectural Model & Dollhouse</span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] border border-amber-500/30">
              WebGL 3D Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Spatial 3D Digital Twin • {listing.address}
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Rotate, zoom, and inspect architectural cutaways of this 4,120 sq ft custom home. Test sun exposure or load your own 3D model via local upload, public URL, or sample library.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFormatGuide(!showFormatGuide)}
            className="flex items-center gap-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700 hover:border-stone-500 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Format Guide</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('url');
              setShowLoadModal(true);
            }}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
          >
            <Link className="w-3.5 h-3.5 text-amber-400" />
            <span>Load URL</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              setShowLoadModal(true);
            }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-stone-950" />
            <span>{isCustomModelLoaded ? 'Change 3D Model' : 'Load 3D Model (.glb)'}</span>
          </button>
        </div>
      </div>

      {/* Preset Fast-Switch Bar */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-300">
          <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">Active 3D Model:</span>
          <span className="text-amber-300 font-bold">
            {isCustomModelLoaded ? customFileName : '428 Crestview Architectural Twin'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_MODELS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                (!isCustomModelLoaded && preset.isProcedural) || (isCustomModelLoaded && activePreset === preset.id)
                  ? 'bg-amber-500 text-stone-950 font-black shadow'
                  : 'bg-stone-950 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>{preset.name}</span>
            </button>
          ))}

          {isCustomModelLoaded && (
            <button
              onClick={handleResetToVillaModel}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all cursor-pointer"
            >
              Reset to Villa
            </button>
          )}
        </div>
      </div>

      {/* Interactive 3D Model Loader Modal (Upload / URL / Presets / Paste) */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Load 3D Architectural Model</h3>
                  <p className="text-xs text-stone-400">Supports .glb (Binary glTF), .gltf, and .obj formats</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoadModal(false)}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-stone-800 bg-stone-950/60 p-2 gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'upload', label: '1. Local File Upload', icon: UploadCloud },
                { id: 'url', label: '2. Load from Public URL', icon: Link },
                { id: 'presets', label: '3. Architectural Presets', icon: Sparkles },
                { id: 'paste', label: '4. Paste Base64 / glTF', icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-4">
              
              {/* TAB 1: FILE UPLOAD & DROPZONE */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-stone-950/70 rounded-2xl p-8 text-center space-y-4 transition-all">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Select or Drag & Drop your 3D Model File</h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                        Choose your exported <code className="text-amber-400 font-mono">.glb</code>, <code className="text-amber-400 font-mono">.gltf</code>, or <code className="text-amber-400 font-mono">.obj</code> file directly from your computer.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <label className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all">
                        <UploadCloud className="w-4 h-4" />
                        <span>Browse Computer Files...</span>
                        <input
                          type="file"
                          accept=".glb,.gltf,.obj"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-stone-400 pt-2 border-t border-stone-900">
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> GLB (Binary glTF 2.0)</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> glTF (JSON)</span>
                      <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Wavefront OBJ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOAD FROM URL */}
              {activeTab === 'url' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-300">
                      Direct Public 3D Model URL (.glb / .gltf / .obj):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/models/my-house.glb"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => loadModelFromUrl(urlInput)}
                        disabled={!urlInput.trim() || loadingModel}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-extrabold px-5 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all shadow"
                      >
                        {loadingModel ? 'Fetching...' : 'Load Model'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Quick Sample GLB URLs (Click to test):
                    </span>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          setUrlInput('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/House/glTF-Binary/House.glb');
                          loadModelFromUrl('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/House/glTF-Binary/House.glb', 'Modern Architectural House');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-stone-900 text-stone-300 hover:text-amber-300 flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-semibold">🏡 Khronos Modern House (Sample GLB)</span>
                        <span className="text-[10px] text-amber-400">Click to load &rarr;</span>
                      </button>
                      <button
                        onClick={() => {
                          setUrlInput('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb');
                          loadModelFromUrl('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb', 'Architectural Lantern Villa');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-stone-900 text-stone-300 hover:text-amber-300 flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-semibold">🏮 Architectural Lantern (PBR Materials GLB)</span>
                        <span className="text-[10px] text-amber-400">Click to load &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ARCHITECTURAL PRESETS */}
              {activeTab === 'presets' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-400">
                    Switch between built-in digital twin configurations and benchmark models:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_MODELS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="p-4 rounded-2xl border border-stone-800 bg-stone-950 hover:border-amber-500/50 hover:bg-stone-900 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white">{preset.name}</h4>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                            {preset.isProcedural ? 'Digital Twin' : 'GLB Binary'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-tight">
                          {preset.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PASTE CODE / BASE64 */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-300">
                      Paste glTF JSON, Base64 Data URI, or OBJ vertices:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPasteFormat('gltf')}
                        className={`px-2 py-1 rounded text-[11px] font-bold ${
                          pasteFormat === 'gltf' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                        }`}
                      >
                        glTF / Base64
                      </button>
                      <button
                        onClick={() => setPasteFormat('obj')}
                        className={`px-2 py-1 rounded text-[11px] font-bold ${
                          pasteFormat === 'obj' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                        }`}
                      >
                        Wavefront OBJ
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    placeholder={
                      pasteFormat === 'gltf'
                        ? 'data:model/gltf-binary;base64,... OR { "asset": { "version": "2.0" }, ... }'
                        : 'v 0.0 0.0 0.0\nv 1.0 0.0 0.0\nv 1.0 1.0 0.0\nf 1 2 3'
                    }
                    value={pasteInput}
                    onChange={(e) => setPasteInput(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={() => loadModelFromText(pasteInput, pasteFormat)}
                      disabled={!pasteInput.trim() || loadingModel}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer shadow"
                    >
                      {loadingModel ? 'Parsing Model...' : 'Parse & Render 3D Model'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 3D Format Advisor & Recommendation Card */}
      {showFormatGuide && (
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in text-stone-200">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Recommended 3D File Format: GLB (.glb)</h3>
            </div>
            <button
              onClick={() => setShowFormatGuide(false)}
              className="text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1. Best Format: GLB (.glb)</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                <strong>GLB (Binary glTF)</strong> is the undisputed real estate & web 3D standard. It packs all geometry meshes, PBR textures, materials, and lighting into a single compressed file.
              </p>
              <div className="text-[11px] text-amber-400/90 font-mono">
                ✓ 10x faster load • Self-contained • PBR materials
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-300 font-bold">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                <span>2. Also Supported: GLTF & OBJ</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                <strong>.gltf</strong> (JSON) and <strong>.obj</strong> (Wavefront geometry) can be loaded directly. If your model has external texture files, pack them into a <strong>.glb</strong> file first for maximum fidelity.
              </p>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-300 font-bold">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>3. Exporting From Software</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                • <strong>Matterport / Sketchfab</strong>: Export as "glTF / GLB".<br/>
                • <strong>Blender / SketchUp / Revit / Rhino</strong>: File &rarr; Export &rarr; <em>glTF 2.0 (.glb)</em>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Model Loading Feedback / Error Banner */}
      {loadingModel && (
        <div className="bg-indigo-950/60 border border-indigo-500 text-indigo-200 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Parsing and optimizing 3D model geometry ({customFileName})...</span>
        </div>
      )}

      {modelError && (
        <div className="bg-rose-950/60 border border-rose-500 text-rose-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <span>{modelError}</span>
          <button
            onClick={handleResetToVillaModel}
            className="bg-rose-800 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold"
          >
            Reset to Architectural Villa
          </button>
        </div>
      )}

      {/* Custom Model Active Notice */}
      {isCustomModelLoaded && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Viewing custom uploaded model: <strong>{customFileName}</strong></span>
          </div>
          <button
            onClick={handleResetToVillaModel}
            className="bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Switch Back to Property Twin
          </button>
        </div>
      )}

      {/* Main 3D Canvas Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 3D Viewport Column */}
        <div className="lg:col-span-9 space-y-3">
          
          <div 
            ref={containerRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-[580px] sm:h-[640px] bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl group select-none"
          >
            {/* Canvas */}
            <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

            {/* Top-Left View Overlay Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
              <span className="bg-stone-950/85 backdrop-blur-md border border-stone-800 text-stone-200 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1.5 pointer-events-auto">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Orbit: Click & Drag • Pan: Right Click</span>
              </span>

              {showDimensions && (
                <span className="bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1.5 pointer-events-auto">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>4,120 SqFt • 12ft Ceilings</span>
                </span>
              )}
            </div>

            {/* Top-Right Viewport Quick Actions */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2.5 rounded-xl border backdrop-blur-md text-xs font-bold transition-all cursor-pointer shadow ${
                  autoRotate
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'bg-stone-900/85 text-stone-300 hover:text-white border-stone-800'
                }`}
                title="Toggle 360 Auto-Rotation"
              >
                <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleResetCamera}
                className="p-2.5 rounded-xl border bg-stone-900/85 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-800 backdrop-blur-md text-xs font-bold transition-all cursor-pointer shadow"
                title="Reset Camera to Front Elevation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className={`p-2.5 rounded-xl border backdrop-blur-md text-xs font-bold transition-all cursor-pointer shadow ${
                  showDimensions
                    ? 'bg-stone-800 text-amber-400 border-amber-500/50'
                    : 'bg-stone-900/85 text-stone-400 border-stone-800'
                }`}
                title="Toggle Spatial Dimensions HUD"
              >
                <Ruler className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-Center Interactive Floor & Cutaway Selector Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-stone-950/85 backdrop-blur-md border border-stone-800 p-2.5 rounded-2xl shadow-2xl">
              
              {/* Floor Layers */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 hidden sm:inline">
                  Floors:
                </span>

                {[
                  { id: 'all', label: 'Full Villa' },
                  { id: 'level1', label: 'Level 1 (Ground)' },
                  { id: 'level2', label: 'Level 2 (Suites)' },
                  { id: 'roof', label: 'Roof & Solar' },
                  { id: 'exploded', label: 'Exploded Cutaway' },
                ].map((fl) => (
                  <button
                    key={fl.id}
                    onClick={() => setFloorLevel(fl.id as FloorLevel)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      floorLevel === fl.id
                        ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                        : 'bg-stone-900/90 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>

              {/* Render Style Modes */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1 hidden md:inline">
                  Style:
                </span>
                {[
                  { id: 'pbr', label: 'Photoreal' },
                  { id: 'clay', label: 'Clay Model' },
                  { id: 'wireframe', label: 'Wireframe' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setRenderMode(mode.id as RenderMode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      renderMode === mode.id
                        ? 'bg-stone-800 text-amber-300 border border-amber-500/40'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exploded Dollhouse Separation Slider (When in exploded mode) */}
            {floorLevel === 'exploded' && (
              <div className="absolute top-16 left-4 z-10 bg-stone-950/90 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl shadow-xl max-w-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">Dollhouse Slice Gap</span>
                  <span className="font-mono text-stone-300">{explodedGap}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={explodedGap}
                  onChange={(e) => setExplodedGap(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                />
              </div>
            )}

            {/* Drag & Drop Hint Overlay (when user drags) */}
            <div className="absolute inset-0 border-2 border-dashed border-amber-500/0 hover:border-amber-500/40 rounded-3xl pointer-events-none transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/80 backdrop-blur-sm px-4 py-2 rounded-xl text-xs text-stone-300 border border-stone-800">
                Drag & drop your <code className="text-amber-400">.glb</code> or <code className="text-amber-400">.obj</code> file directly here
              </div>
            </div>
          </div>

          {/* Time of Day & Solar Lighting Controls */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-stone-300">
              <Sun className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <strong className="text-white">Solar Sunlight Study: </strong>
                <span>
                  {timeOfDay <= 11 ? `${timeOfDay}:00 AM (Morning Sunlight)` : timeOfDay === 12 ? '12:00 PM (Noon Light)' : `${timeOfDay - 12}:00 PM (${timeOfDay >= 18 ? 'Twilight / Evening' : 'Golden Hour Sunset'})`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-72">
              <SunriseIcon className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="range"
                min="6"
                max="21"
                step="1"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
              />
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setTimeOfDay(11)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  timeOfDay === 11 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-950 text-stone-400 hover:text-white'
                }`}
              >
                Noon
              </button>
              <button
                onClick={() => setTimeOfDay(16)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  timeOfDay === 16 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-950 text-stone-400 hover:text-white'
                }`}
              >
                Sunset
              </button>
              <button
                onClick={() => setTimeOfDay(20)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  timeOfDay === 20 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-950 text-stone-400 hover:text-white'
                }`}
              >
                Night
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: 3D Room Jump Waypoints & Spatial Specs */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Room Fly-To Waypoints */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>3D Room Waypoints</span>
              </h4>
              <span className="text-[10px] text-stone-400 font-mono">Fly-to Camera</span>
            </div>

            <p className="text-xs text-stone-400 leading-tight">
              Click any room to fly the 3D camera inside and inspect structural flow:
            </p>

            <div className="space-y-2">
              {ROOM_WAYPOINTS.map((wp) => {
                const isSelected = selectedWaypoint === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => handleFlyToWaypoint(wp)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-stone-950/80 hover:bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-white">{wp.name}</h5>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-stone-900 px-1.5 py-0.5 rounded">
                        {wp.sqft} sqft
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 leading-tight">{wp.highlight}</p>
                    
                    {wp.roomRefId && onSelectRoomTour && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRoomTour(wp.roomRefId!);
                        }}
                        className="mt-2 text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>View 360 Photo Panorama &rarr;</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architectural Digital Twin Specs */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Digital Twin Dimensions</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Total Living Area</span>
                <span className="font-bold text-stone-200">4,120 Sq Ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Ceiling Clearance</span>
                <span className="font-bold text-stone-200">10' – 14' Volume</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Pool Length & Depth</span>
                <span className="font-bold text-stone-200">40' x 16' (6' Depth)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Solar Power Array</span>
                <span className="font-bold text-stone-200">12.4 kW (Owned)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-400">Lot Dimensions</span>
                <span className="font-bold text-stone-200">0.34 Acres Hillside</span>
              </div>
            </div>

            {onBookShowing && (
              <button
                onClick={onBookShowing}
                className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow cursor-pointer"
              >
                Schedule In-Person Walkthrough
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// Custom Sunrise Icon
function SunriseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v6" />
      <path d="M4.93 10.93l4.24-4.24" />
      <path d="M2 18h20" />
      <path d="M20 10h-4" />
      <path d="M19.07 10.93l-4.24-4.24" />
      <path d="M22 22H2" />
      <path d="M8 18a4 4 0 0 1 8 0" />
    </svg>
  );
}
