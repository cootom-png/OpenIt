import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface ThreeViewerHandle {
  captureScreenshot: () => Promise<string | null>;
}

interface ThreeViewerProps {
  meshData: ParsedMeshData | null;
  className?: string;
}

export interface ParsedMeshData {
  meshes: Array<{
    name: string;
    color?: [number, number, number];
    attributes: {
      position: { array: number[] };
      normal?: { array: number[] };
    };
    index: { array: number[] };
  }>;
  root?: {
    name: string;
    meshes?: number[];
    children?: any[];
  };
}

const ThreeViewer = forwardRef<ThreeViewerHandle, ThreeViewerProps>(
  function ThreeViewer({ meshData, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animFrameRef = useRef<number>(0);

    // Expose captureScreenshot method via ref
    useImperativeHandle(ref, () => ({
      captureScreenshot: async () => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!renderer || !scene || !camera) return null;

        // Force render a frame and immediately capture
        renderer.render(scene, camera);
        try {
          const dataUrl = renderer.domElement.toDataURL("image/png");
          if (dataUrl && dataUrl.length > 500) {
            return dataUrl;
          }
        } catch (err) {
          console.warn("Three.js screenshot failed:", err);
        }
        return null;
      },
    }));

    const initScene = useCallback(() => {
      if (!containerRef.current) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f4f8);
      sceneRef.current = scene;

      // Grid
      const gridHelper = new THREE.GridHelper(500, 50, 0xcccccc, 0xe0e0e0);
      scene.add(gridHelper);

      // Axes
      const axesHelper = new THREE.AxesHelper(100);
      scene.add(axesHelper);

      // Camera
      const rect = containerRef.current.getBoundingClientRect();
      const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 10000);
      camera.position.set(200, 200, 200);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(rect.width, rect.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.minDistance = 1;
      controls.maxDistance = 5000;
      controlsRef.current = controls;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight1.position.set(200, 300, 200);
      dirLight1.castShadow = true;
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      dirLight2.position.set(-200, 100, -200);
      scene.add(dirLight2);

      // Animate
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    }, []);

    // Handle resize
    useEffect(() => {
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        cameraRef.current.aspect = rect.width / rect.height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(rect.width, rect.height);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Init scene
    useEffect(() => {
      initScene();
      return () => {
        cancelAnimationFrame(animFrameRef.current);
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }
      };
    }, [initScene]);

    // Load mesh data
    useEffect(() => {
      if (!meshData || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;

      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      // Remove old meshes (keep grid, axes, lights)
      const toRemove: THREE.Object3D[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          toRemove.push(child);
        }
      });
      toRemove.forEach((obj) => {
        scene.remove(obj);
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      });

      const group = new THREE.Group();

      meshData.meshes.forEach((meshItem) => {
        const geometry = new THREE.BufferGeometry();

        // Position
        const positions = new Float32Array(meshItem.attributes.position.array);
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        // Normal
        if (meshItem.attributes.normal) {
          const normals = new Float32Array(meshItem.attributes.normal.array);
          geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        } else {
          geometry.computeVertexNormals();
        }

        // Index
        if (meshItem.index && meshItem.index.array) {
          const indices = new Uint32Array(meshItem.index.array);
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        }

        // Material
        let color = 0x6699cc;
        if (meshItem.color && meshItem.color.length === 3) {
          color = new THREE.Color(meshItem.color[0], meshItem.color[1], meshItem.color[2]).getHex();
        }

        const material = new THREE.MeshPhongMaterial({
          color,
          specular: 0x333333,
          shininess: 30,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });

      scene.add(group);

      // Fit camera to model
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 1.8;

      camera.position.set(center.x + distance * 0.6, center.y + distance * 0.5, center.z + distance * 0.6);
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    }, [meshData]);

    return (
      <div
        ref={containerRef}
        className={`w-full h-full ${className || ""}`}
        style={{ minHeight: "400px" }}
      />
    );
  }
);

export default ThreeViewer;
