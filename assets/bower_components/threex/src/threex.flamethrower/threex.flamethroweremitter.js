var THREEx	= THREEx	|| {}

THREEx.FlameThrowerEmitter	= function(flameSprite, container){
	// handle local loop
	var updateFcts	= [];
	this.update	= function(delta, now){
		updateFcts.forEach(function(updateFct){
			updateFct(delta, now)
		})
	}
	// init trigger
	var trigger	= new MidiTrigger(0.2, 0.2)
	this.trigger	= trigger;
	// handle tweening
	var age2Friction= (function(){
		var gradient	= createLinearGradient([
			{x : 0.00, y: 1.00}, {x : 0.50, y: 1.00},
			{x : 0.70, y: 0.95}, {x : 1.00, y: 0.95}
		]);
		return function(age, maxAge){ return gradient(age/maxAge)	}
	})();
	var age2Opacity	= (function(){
		var tween	= createTweenMidi(1, 0.1, 0.5)
		return function(age, maxAge){ return tween(age/maxAge)	}
	})();
	var age2uvOffset= function(age, maxAge){
		var nTiles	= flameSprite.nTiles
		var imageIdx	= Math.floor(age/maxAge * nTiles);
		var uvOffsetY	= 1 - imageIdx * 1/nTiles;
		return uvOffsetY
	}
	// put the emmiter
	this.emitOne	= function(startPosition, initialVelocity){
		// randomize the initial position
		var position	= startPosition.clone()
		// clone the flameSprite
		var flameSprite0= flameSprite.clone()
		var sprite	= flameSprite0.object3d
		var material	= sprite.material
		// init sprite
		sprite.position.copy(position)
		sprite.rotation	= Math.random()*Math.PI*2
		sprite.scale.set(1,1,1).multiplyScalar(2)
		container.add( sprite )

		// init age2OffsetY
		var uvOffset	= age2uvOffset(0, maxAge)
		material.uvOffset.set(0, uvOffset)

		var maxAge	= 1.2 + (Math.random()-0.5)*0

		// set velocity
		var speed	= initialVelocity.length()
		var velocity	= initialVelocity.clone().normalize()
		velocity.x	+= (Math.random()-0.5)*0.0
		velocity.y	+= (Math.random()-0.5)*0.2
		velocity.z	+= (Math.random()-0.5)*0.0
		velocity.setLength(speed)
		// set acceleration
		var acceleration= new THREE.Vector3(0, 2, 0)
		// init opacity
		material.opacity= age2Opacity(0, maxAge)
		
		var birthDate	= Date.now()/1000
		updateFcts.push(function callback(delta, now){
			var age	= Date.now()/1000 - birthDate
			if( age >= maxAge ){
				sprite.parent.remove(sprite)
				updateFcts.splice(updateFcts.indexOf(callback),1)
				return;	
			}
			// handle acceleration
			velocity.add(acceleration.clone().multiplyScalar(delta))
			// handle friction
			velocity.multiplyScalar( age2Friction(age, maxAge) )
			// move by velocity
			sprite.position.add( velocity.clone().multiplyScalar(delta) )
			// make it grow
			sprite.scale.multiplyScalar( 1.015 )
			// handle opacity
			material.opacity= age2Opacity(age, maxAge)
			// init uvOffset
			material.uvOffset.set(0, age2uvOffset(age, maxAge))
		})
	}

	
	//////////////////////////////////////////////////////////////////////////////////
	//		support .start/.stop pattern with a trigger as intensity	//
	//////////////////////////////////////////////////////////////////////////////////
	
	var _loopCb	= null;
	this.start	= function(maxRate, emitOneFn){
		var lastEmit	= 0;
		updateFcts.push(_loopCb	= function(delta, now){
			// rate limiter emition
			var rate	= maxRate * trigger.intensity();
			if( rate === 0 || now - lastEmit < 1/rate )	return;
			lastEmit	= now;
			// emit one
			emitOneFn()
		}.bind(this))
		return this;		
	}
	this.stop	= function(){
		updateFcts.splice(updateFcts.indexOf(_loopCb),1)
		return this;
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		micro lib							//
	//////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * trigger with a attack, a sustain and a release. like midi notes
	 * 
	 * @param {Number} attackDelay  nb second for the attack phase
	 * @param {Number} releaseDelay nb second for the release phase
	 * @param {Number} maxValue     the maximum value of the intensity
	 */
	function MidiTrigger(attackDelay, releaseDelay){
		var lastStart	= 0, lastStop	= 0;
		this.start	= function(){ lastStart = Date.now()/1000 }
		this.stop	= function(){ lastStop  = Date.now()/1000 }
		this.intensity	= function(){
			var present	= Date.now()/1000
			if( lastStop >= lastStart ){				// release in-progress or overs
				if(present - lastStop >= releaseDelay) return 0 // release over
				return 1 - (present - lastStop) / releaseDelay	// release inprogress
			}else if( present - lastStart <= attackDelay ){ 	// attack in-progress
				return (present - lastStart) / attackDelay
			}else	return 1;					// sustain in-progress
		}
	}
	function createTweenMidi(maxAge, attackTime, releaseTime){
		return function(age){
			if( age < attackTime ){
				return age / attackTime
			}else if( age < maxAge - releaseTime ){
				return 1;
			}else{
				return (maxAge - age) / releaseTime
			}
		}	
	}
	function createLinearGradient(keyPoints){
		return function(x){
			// find the keyPoints 
			for( var i = 0; i < keyPoints.length; i++ ){
				if( x <= keyPoints[i].x )	break;
			}
			if( i === 0 )	return keyPoints[0].y;
			// sanity check
			console.assert(i < keyPoints.length );
			// compute the y
			var previous	= keyPoints[i-1];
			var next	= keyPoints[i];
			var ratio	= (x - previous.x) / (next.x - previous.x)
			var y		= previous.y + ratio * (next.y - previous.y)
			// return y
			return y;
		}
	}
}
