// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

var renderer = null, 
scene = null, 
camera = null,
root = null,
gun = null,
monster = null,
group = null,
orbitControls = null;

var objLoader = null, jsonLoader = null;
var monsterMovement=null;
var duration = 15; // ms
var currentTime = Date.now();

function loadJson()
{
    if(!jsonLoader)
    jsonLoader = new THREE.JSONLoader();
    
    jsonLoader.load(
        '../models/monster/monster.js',

        function(geometry, materials)
        {
            var material = materials[0];
            
            var object = new THREE.Mesh(geometry, material);
            object.castShadow = true;
            object. receiveShadow = true;
            object.scale.set(0.002, 0.002, 0.002);
            object.position.y = -3.5;
            object.position.x = 1.5;
            monster = object;
            scene.add(object);
            //playAnimations(monster);
            playAnimations();
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    
    objLoader.load(
        '../models/monster/Cerberus.obj',

        function(object)
        {
            var texture = new THREE.TextureLoader().load('../models/cerberus/Cerberus_A.jpg');
            var normalMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_N.jpg');
            var specularMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_M.jpg');

            object.traverse( function ( child ) 
            {
                if ( child instanceof THREE.Mesh ) 
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                    child.material.specularMap = specularMap;
                }
            } );
                    
            gun = object;
            gun.scale.set(3,3,3);
            gun.position.z = -3;
            gun.position.x = -1.5;
            gun.rotation.x = Math.PI / 180 * 15;
            gun.rotation.y = -3;
            scene.add(object);

        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    if(gun)
        gun.rotation.y += angle / 2;

   // if(monster)
     //   monster.rotation.y += angle / 2;
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-2, 6, 12);
    scene.add(camera);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 0, 3);
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create the objects
    //loadObj();

    loadJson();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    
    
    // Now add the group to our scene
    scene.add( root );
}
function playAnimations() 
{
  //Inicializa una variable tipo keyframeanimator para cierto objeto
  monsterMovement = new KF.KeyFrameAnimator;
  
  // Inicializa los valores del keyframe
  monsterMovement.init({
    interps:
        [
        {
          keys:[0, 0.9],
          values: [
            { y: 0},
            { y: 4 *  Math.PI / 2}
            ],
          target: monster.rotation
        },
        {
            keys:[0, 0.05, 0.1, 0.15,  0.2, 0.25, 0.3, 0.35,  0.4, 0.45,  0.5, 0.55,  0.6, 0.65, 0.7, 0.75,  0.8, 0.85,  0.9, 0.95, 1],
            values:[
                    { x : 7*Math.sin(0), z : 7*Math.cos(0) },
                    { x : 7*Math.sin(Math.PI/10), z : 7*Math.cos(Math.PI/10) },
                    { x : 7*Math.sin(2*Math.PI/10), z : 7*Math.cos(2*Math.PI/10) },
                    { x : 7*Math.sin(3*Math.PI/10), z : 7*Math.cos(3*Math.PI/10) },
                    { x : 7*Math.sin(4*Math.PI/10), z : 7*Math.cos(4*Math.PI/10) },
                    { x : 7*Math.sin(5*Math.PI/10), z : 7*Math.cos(5*Math.PI/10) },
                    { x : 7*Math.sin(6*Math.PI/10), z : 7*Math.cos(6*Math.PI/10) },
                    { x : 7*Math.sin(7*Math.PI/10), z : 7*Math.cos(7*Math.PI/10) },
                    { x : 7*Math.sin(8*Math.PI/10), z : 7*Math.cos(8*Math.PI/10) },
                    { x : 7*Math.sin(9*Math.PI/10), z : 7*Math.cos(9*Math.PI/10) },
                    { x : 7*Math.sin(10*Math.PI/10), z : 7*Math.cos(10*Math.PI/10) },
                    { x : 7*Math.sin(11*Math.PI/10), z : 7*Math.cos(11*Math.PI/10) },
                    { x : 7*Math.sin(12*Math.PI/10), z : 7*Math.cos(12*Math.PI/10) },
                    { x : 7*Math.sin(13*Math.PI/10), z : 7*Math.cos(13*Math.PI/10) },
                    { x : 7*Math.sin(14*Math.PI/10), z : 7*Math.cos(14*Math.PI/10) },
                    { x : 7*Math.sin(15*Math.PI/10), z : 7*Math.cos(15*Math.PI/10) },
                    { x : 7*Math.sin(16*Math.PI/10), z : 7*Math.cos(16*Math.PI/10) },
                    { x : 7*Math.sin(17*Math.PI/10), z : 7*Math.cos(17*Math.PI/10) },
                    { x : 7*Math.sin(18*Math.PI/10), z : 7*Math.cos(18*Math.PI/10) },
                    { x : 7*Math.sin(19*Math.PI/10), z : 7*Math.cos(19*Math.PI/10) },
                    { x : 7*Math.sin(20*Math.PI/10), z : 7*Math.cos(20*Math.PI/10) },
                    
                    ],
                    target: monster.position

        },
      ],
    loop: true,
    duration: duration * 1000
  });
  
  // Empieza a animar estos valores
  monsterMovement.start();
}