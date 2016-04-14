window.background = (function(win, $) {
    var $el;
    var scene;
    var camera;
    var standStill = false;
    var debouncer;
    var scrollPercentage = 0.50;

    function init()
    {
	var STARS = 1999;
	var point;

	addLights();
	for (var i = 0; i < STARS; i++)
	{
            point = epixlib.addSphere(getRandomArbitrary(0x000000, 0xffffff), 2, 6, 6, 0.3);
	    point.position.x = getRandomArbitrary(-400, 400);
	    point.position.y = getRandomArbitrary(400, -400);
            point.position.z = getRandomArbitrary(-400, 400);
	}
	update();
    }

    $(window).ready(function() {
        createBaseScene($('body'));
        init();

        render();
    });

    // Camera moves on y upon scrolling (mouse wheel)
    $(win).bind('mousewheel', function(event) {
        if (event.originalEvent.wheelDelta >= 0) {
            if (scrollPercentage > 0)
                scrollPercentage -= 10 / $(win).height();
        }
        else if (scrollPercentage < 1)
            scrollPercentage += 10 / $(win).height();
        background.update();
        camera.position.z = 200 * scrollPercentage - 100;
    });


    function addLights()
    {
	var light = new THREE.AmbientLight( 0xff9955 );
	light.position.set( getRandomArbitrary(-400, 400), getRandomArbitrary(-400, 400), getRandomArbitrary(-400, 400));
	scene.add( light );
	return light;
    }

    function update() {
	var MAX_CAM = 120;
	var MIN_CAM = -120;

	standStill = false;
	debouncer = clearTimeout(debouncer);
	debouncer = setTimeout(function() {
            standStill = true;
	}, 100);
    }



    function createBaseScene($element) {
        var ASPECT = window.innerWidth / window.innerHeight;
        var FAR = 5000;
        var FOV = 45;
        var NEAR = 0.1;

        $el = $element;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0x000000);
        renderer.shadowMapEnabled = true;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );

        $el.append(renderer.domElement);
    }

    // That's the display loop, should be called 60times/sec
    function render() {
//      var timer = Date.now() * 0.0001;
        background.update();
        cta.update();
        game.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    return {
	init: init,
	update: update
    }

})(window, this.jQuery);
