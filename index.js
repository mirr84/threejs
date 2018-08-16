var camera, scene, renderer, controls;

var objects = [];

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controlsEnabled = true;
            controls.enabled = true;

            blocker.style.display = 'none';

        } else {

            controls.enabled = false;

            blocker.style.display = 'block';

            instructions.style.display = '';

        }

    };

    var pointerlockerror = function ( event ) {

        instructions.style.display = '';

    };

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();

    }, false );

}

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

const init = () => {

    // camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    var onKeyDown = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

        }

    };
    var onKeyUp = function ( event ) {

        switch( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // light
    var light = new THREE.PointLight( 0xffffff, 1, 1000 );
    light.position.set( 50, 50, 50 );
    light.castShadow = true;
    scene.add( light );

    var geometry = new THREE.SphereGeometry( 1, 4, 4 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add( sphere );

    var geometry = new THREE.SphereGeometry( 1, 8, 8 );
    var material = new THREE.MeshStandardMaterial( {color: 0xffffff} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(50, 40, 50);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    var geometry = new THREE.SphereGeometry( 1, 8, 8 );
    var material = new THREE.MeshStandardMaterial( {color: 0xffffff} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(50, 50, 40);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );

    // floor
    var floorGeometry = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );
    floorGeometry.rotateX( - Math.PI / 2 );
    var floorMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff} );
    var floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.receiveShadow = true;
    scene.add( floor );

    // objects
    var boxGeometry = new THREE.BoxBufferGeometry( 9.9, 9.9, 9.9 );
    boxGeometry = boxGeometry.toNonIndexed();

    var a = 0, b = 0;
    for ( var i = 0; i < 100; i ++ ) {
        var boxMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );

        var box = new THREE.Mesh( boxGeometry, boxMaterial );

        box.position.x = Math.floor( a*10 + 5 );
        box.position.y = Math.floor( b*10 + 5 );
        box.position.z = Math.floor( 0 + 5 );

        box.castShadow = true;
        box.receiveShadow = true;

        scene.add( box );
        objects.push( box );

        a++;
        if (a == 10) { b++; a = 0; };
    }

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener( 'resize', onWindowResize, false );
}

const animate = ()  => {

    requestAnimationFrame( animate );

    if ( controlsEnabled === true ) {

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= velocity.y * 10.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveLeft ) - Number( moveRight );
        direction.normalize();

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );

        controls.getObject().position.y = 10;

        prevTime = time;

    }

    renderer.render( scene, camera );

}

init();
animate();
