import * as THREE from 'three'
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
  FBXLoader
} from 'three/addons/loaders/FBXLoader.js'
import {
  TextGeometry
} from 'three/addons/geometries/TextGeometry.js';
import {
  FontLoader
} from 'three/addons/loaders/FontLoader.js';
import {
  TWEEN
} from 'three/addons/libs/tween.module.min.js'

let fbxModel
const skyboxTextures = [
  'storage/skybox1/left.png', //left
  'storage/skybox1/right.png', //right
  'storage/skybox1/top.png', //up
  'storage/skybox1/bottom.png', // dpwn
  'storage/skybox1/back.png', // back
  'storage/skybox1/front.png',
];

const skyboxMaterials = skyboxTextures.map(texture => {
  const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(texture),
    side: THREE.BackSide
  });
  return material;
});

const skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);


const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(0, 0, 200);
camera.lookAt(skybox.position);

const scene = new THREE.Scene();
scene.add(skybox);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
//controls.enablePan = false;
//controls.minPolarAngle = Math.PI / 2;
//controls.maxPolarAngle = Math.PI / 2;
controls.enabled = true;
controls.update()

const light = new THREE.PointLight(0xffffff, 4, 10000);
light.position.set(1000, 0, 500);

const light2 = new THREE.PointLight(0xffffff, 1, 10000);
light2.position.set(-1000, 0, 500);


scene.add(light);
scene.add(light2)



// Load the FBX model
const fbxLoader = new FBXLoader();
fbxLoader.load('storage/mars.fbx', (fbx) => {
  fbx.position.set(0, 0, 0);
  fbx.scale.set(1, 1, 1);
  scene.add(fbx);

  const box = new THREE.Box3().setFromObject(fbx);
  const center = new THREE.Vector3();
  box.getCenter(center);
  camera.lookAt(center);

  const lightTarget = new THREE.Object3D();
  lightTarget.position.copy(center);
  scene.add(lightTarget);
  light.target = lightTarget;


  const lightTarget2 = new THREE.Object3D();
  lightTarget2.position.copy(center);
  scene.add(lightTarget2);
  light2.target = lightTarget2;

  var mesh = fbx.children[0];

  var positions = [];
  var meshes = [];
  for (var i = 0; i < 8; i++) {
    var u = Math.random();
    var v = Math.random();
    var theta = 2 * Math.PI * u;
    var phi = Math.acos(2 * v - 1);
    var x = 1.2 * Math.sin(phi) * Math.cos(theta);
    var y = 1.2 * Math.sin(phi) * Math.sin(theta);
    var z = 1.2 * Math.cos(phi) + 0;

    let size = 0.01
    const geometry = new THREE.SphereGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z)
    mesh.add(cube);
    meshes.push(cube);
    const loader = new FontLoader();

    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  
      let factor = 10
      // Loop through each mesh in the array
      const geometry = new TextGeometry('Hello three.js!', {
        font: font,
        size: 0.05,
        height: 0.005,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.002,
        bevelSize: 0.001,
        bevelOffset: 0,
        bevelSegments: 5
      });
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      // Create a text mesh from the text geometry and material
      const textMesh = new THREE.Mesh(geometry, textMaterial);
    
      // Set the text mesh's position above the cube
      textMesh.position.set(x, y, z);
    
      console.log(cube.position)
      // Add the text mesh to the scene
      mesh.add(textMesh);
    });
    
  }

  scene.add(mesh);
 

  const raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener('click', function (event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      console.log("click")

      const intersection = intersects[0].point;
      const currentCameraPosition = new THREE.Vector3().copy(camera.position);
      new TWEEN.Tween(currentCameraPosition)
        .to(intersection, 3000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.position.copy(currentCameraPosition);
        })
        .start();
    }
  });


});

const portfolioLink = document.querySelector('.topnav .Portfolio');

portfolioLink.addEventListener('click', event => {
  event.preventDefault();
  const currentCameraPosition = new THREE.Vector3().copy(camera.position);
  new TWEEN.Tween(currentCameraPosition)
    .to(new THREE.Vector3(0, 0, 200), 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.position.copy(currentCameraPosition);
    })
    .start();
});


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  TWEEN.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
animate();