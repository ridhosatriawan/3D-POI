import * as THREE from "three";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const poiMarkers = [];

const pois = [
  {
    name: "POI 1",
    description: "This is point of interest #1",
    position: new THREE.Vector3(0, 0, 0),
  },
  {
    name: "POI 2",
    description: "This is point of interest #2",
    position: new THREE.Vector3(1, 1, 1),
  },
];

const container = document.getElementById("poi-container");
const loadingElement = document.getElementById("loading");
const statsBox = document.getElementById("camera-stats");
const toggleBtn = document.getElementById("poi-toggle");
const infoBox = document.getElementById("poi-info");

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(4, 2, 1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  //   renderer.setPixelRatio(window.devicePixelRatio * 0.5);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  setupPOIs();
  loadModel();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onClick);

  animate();
}

function loadModel() {
  const loader = new PLYLoader();
  loader.load(
    "/model.ply",
    (geometry) => {
      geometry.computeVertexNormals();
      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: geometry.hasAttribute("color"),
      });
      const points = new THREE.Points(geometry, material);
      loadingElement.style.display = "none";
      scene.add(points);
    },
    (xhr) => {
      const percent = (xhr.loaded / xhr.total) * 100;
      loadingElement.textContent = `Loading model: ${percent.toFixed(1)}%`;
    },
    (error) => {
      loadingElement.textContent = "Failed to load model.";
      console.error("Error loading PLY:", error);
    }
  );
}

function setupPOIs() {
  toggleBtn.addEventListener("click", () => {
    const show = container.style.display !== "flex";
    container.style.display = show ? "flex" : "none";
    toggleBtn.textContent = show ? "Hide POIs" : "Show POIs";
  });

  pois.forEach((poi) => {
    // UI Button
    const btn = document.createElement("button");
    btn.textContent = poi.name;
    btn.className = "poi-btn";
    btn.onclick = () => focusPOI(poi);
    container.appendChild(btn);

    // 3D Marker
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    marker.position.copy(poi.position);
    marker.userData = poi;
    scene.add(marker);
    poiMarkers.push(marker);
  });
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(poiMarkers);

  if (intersects.length > 0) {
    const poi = intersects[0].object.userData;
    focusPOI(poi);
  }
}

function focusPOI(poi) {
  camera.position.copy(poi.position.clone().add(new THREE.Vector3(0, 0.8, 2)));
  camera.lookAt(poi.position);
  infoBox.innerHTML = `<strong>${poi.name}</strong><br>${poi.description}`;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCameraStats() {
  const pos = camera.position;
  const rot = camera.rotation;

  statsBox.innerText = `Camera Position:
  x: ${pos.x.toFixed(2)}
  y: ${pos.y.toFixed(2)}
  z: ${pos.z.toFixed(2)}

Camera Rotation:
  x: ${rot.x.toFixed(2)}
  y: ${rot.y.toFixed(2)}
  z: ${rot.z.toFixed(2)}`;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateCameraStats();
}

init();
