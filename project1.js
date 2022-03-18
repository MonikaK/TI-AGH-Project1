var starting = false;

function toggleSimulation() {
  starting = !starting;
  if (starting) document.getElementById("startButton").innerHTML = "STOP";
  else document.getElementById("startButton").innerHTML = "START";
}


// Oblicza położenie i prędkość klocka
var physics = (function() {
  var initialConditions = {
    position:       1.0,
    velocity:       0.0,
    springConstant: 100.0,
    mass:           10.0
  };

  var state = {
    position: 0,
    velocity: 0,
    springConstant: 0,
    mass: 0
  };

  var deltaT = 0.016;

  function resetStateToInitialConditions() {
    state.position = initialConditions.position;
    state.velocity = initialConditions.velocity;
    state.springConstant = initialConditions.springConstant;
    state.mass = initialConditions.mass;
  }

  // Zwraca wartość przyspieszenia dla danego położenia klocka
  function calculateAcceleration(x) {
    return -(state.springConstant / state.mass) * x;
  }

  // Zwraca nową wartość prędkości
  function newVelocity(acceleration) {
    return state.velocity + deltaT * acceleration;
  }

  // Zwraca nową wartość położenia
  function newPosition() {
    return state.position + deltaT * state.velocity;
  }

  // Główna funkcja wywoływana dla każdej klatki animacji, 
  // aktualizuje położenie klocka
  function updatePosition() {
    var acceleration = calculateAcceleration(state.position);
    if(starting) {
      state.velocity = newVelocity(acceleration);
      state.position = newPosition();
      if (state.position > 1) { state.position = 1; }
      if (state.position < -1) { state.position = -1; } 
    }
  }

  return {
    resetStateToInitialConditions: resetStateToInitialConditions,
    updatePosition: updatePosition,
    initialConditions: initialConditions,
    state: state,
  };
})();

var graphics = (function() {
  var canvas = document.getElementById('animation'),
    context = null,
    canvasWidth = 330,
    boxSize = 70,
    springInfo = {
      width: 70,
      numberOfSegments: 20
    };

  // Zwraca wartość środkowego położenia klocka
  function boxMiddleY(position) {
    var boxSpaceHeight = canvas.height - 2.3*boxSize;
    return boxSpaceHeight*(position + 1)/2 + boxSize;
  }

  //Rysuje sprężynę rozpoczynając od klocka do punktu zawieszenia. Przyjmuje jako argument położenie klocka z przedziału [-1,1]
  function drawSpring(position) {
    var springEndY = boxMiddleY(position),
      springTopX = (canvasWidth-springInfo.width)/2,
      springEndX = canvasWidth/2,
      singleSegmentHeight = springEndY/(springInfo.numberOfSegments-1) - 0.8,
      springGoesLeft = true;
 
    context.lineWidth = 1;
    context.beginPath();
    context.strokeStyle = "#ff6c00";
    context.moveTo(springEndX, springEndY);

    for (var i = 0; i < springInfo.numberOfSegments; i++) {
      var currentSegmentHeight = singleSegmentHeight;
      if (i === 0 || i === springInfo.numberOfSegments - 1) { currentSegmentHeight /= 2; }

      springEndY -= currentSegmentHeight;
      springEndX = springTopX;
      if (!springGoesLeft) { springEndX += springInfo.width; }
      if (i === springInfo.numberOfSegments - 1) { springEndX = canvasWidth/2; }

      context.lineTo(springEndX, springEndY);
      springGoesLeft = !springGoesLeft;
    }

    context.stroke();
    context.beginPath();
    context.fillStyle = "brown";
    context.fillRect(115,0,100,15);
  }

  // Rysuje klocek w danym położeniu
  function drawBox(position) {
    var boxTopX = Math.floor((canvasWidth - boxSize) / 2);
    var startY = boxMiddleY(position);

    context.beginPath();
    context.fillStyle = "#ffb100";
    context.fillRect(boxTopX, startY, boxSize, boxSize);

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "#a66000";
    context.strokeRect(boxTopX + 0.5, startY + 0.5, boxSize - 1, boxSize - 1);
  }

  // Czyści obszar rysowania i wyświetla sprężynę z klockiem.
  function drawScene(position) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSpring(position);
    drawBox(position); 
  }

  function fitToContainer(){
    canvas.style.width='100%';
    canvas.style.height= '100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function init(success) {
    canvas = document.querySelector(".animation-canvas");
    if (!(window.requestAnimationFrame && canvas && canvas.getContext)) { return; }

    context = canvas.getContext("2d");
    if (!context) { return; }

    fitToContainer();
    success();
  }

  return {
    fitToContainer: fitToContainer,
    drawScene: drawScene,
    init: init
  };
})();

var simulation = (function() {
  function animate() {
    physics.updatePosition();
    graphics.drawScene(physics.state.position);
    window.requestAnimationFrame(animate);
  }

  function start() {
    graphics.init(function() {
      physics.resetStateToInitialConditions();
      window.addEventListener('resize', function(event){
        graphics.drawScene(physics.state.position);
      });

      animate();
    });
  }

  return {
    start: start
  };
})();

simulation.start();

var userInput = (function(){
  // Aktualizuje wartość masy i współczynnika sprężystości zgodnie z wprowadzonymi wartościami
  function updateSimulation(massInput, springConstantInput) {
    physics.resetStateToInitialConditions();
    physics.state.mass = parseFloat(massInput.value) || physics.initialConditions.mass;
    physics.state.springConstant = parseFloat(springConstantInput.value) || physics.initialConditions.springConstant;
  }

  function init() {
    var massInput = document.getElementById("animation-mass");

    massInput.value = physics.initialConditions.mass;
    massInput.addEventListener('input', function() {
      updateSimulation(massInput, springConstantInput);
    });

    var springConstantInput = document.getElementById("animation-springConstant");

    springConstantInput.value = physics.initialConditions.springConstant;
    springConstantInput.addEventListener('input', function() {
      updateSimulation(massInput, springConstantInput);
    });
  }

  return {
    init: init
  };
})();

userInput.init();

function css() {
  var a = document.getElementById("doc");
  var d = a.style.display;
  if(d=="block") {
    a.style.display = "none";
  }
  else {
    a.style.display = "block";
  }
}