/**
 * This file starts the graf
 *
 * @author petegoodman.com
 */
var startGraf = (function() {

  // object : the containing page element
  container = null,

  // object: the html canvas area
  canvas = null,

  // int : due to issues with percentages, calculated canvas dimensions
  canvasWidth = null,
  canvasHeight = null,

  // object : the canvas draw context
  drawContext = null,


  /**
   * start the process
   *
   * @return void
   */
  init = function(){

    container = document.getElementsByTagName("body")[0];
    canvas = document.getElementById("graf");

    getCanvasDimensions();

    // create draw context
    drawContext = canvas.getContext("2d");

    emptyCanvas();

    // set a mouse listener
    initMouseListener();

    // listen for sent events
    socket = io.connect();

    // message received
    socket.on('mouse', function (data) {
      draw({
        percentX: data.x,
        percentY: data.y,
        colour:   data.colour,
        size:     data.size
      });
    });

    // set a listener to reset canvas dimensions if ever the canvas is changed
    window.onresize = function(){
      getCanvasDimensions();
      emptyCanvas();
    };
  },


  /*
   *
   */
  emptyCanvas = function() {
    drawContext.fillStyle = "rgba(0, 0, 0, 1)";
    drawContext.fillRect(0, 0, canvasWidth, canvasHeight);
  },


  /*
   * Get and set the Canvas dimensions based on the width and height of the container
   */
  getCanvasDimensions = function(){
    canvas.width = canvasWidth = container.offsetWidth;
    canvas.height = canvasHeight = container.offsetHeight;
  },


  /**
   * Initialise the mouse listener, to detect when the mouse button is being pressed
   */
  initMouseListener = function(){
    document.onmousemove = function(e) {
      //draw(e);
    };
  },

  /*
   * Create a new line
   */
  draw = function(e){

    // set initial line parameters
    var graf = {
      x       : e.clientX || Math.round(canvasWidth * e.percentX),
      y       : e.clientY || Math.round(canvasHeight * e.percentY),
      colour  : e.colour || "#ff9900",
      size    : e.size || 10
    };

    // draw
    drawContext.fillStyle = graf.colour;
    drawContext.beginPath();
    drawContext.arc(graf.x, graf.y, graf.size, 0, Math.PI*2, true);
    drawContext.closePath();
    drawContext.fill();
  };


  /*
   * Reveal methods
   */
  return {
    init: init
  };
})();


// go go go!
window.addEventListener("load", startGraf.init);