/*
 * Graf wall
 */
(function(doc, $) {

  // init on dom load
  $(document).ready(function(){
    detectMouse();
    createColourPicker();
    createSlider();
    rotateLetters();
  });

  // only send when clicking
  var mouseDown = false,

  // page dimensions (to calculate relative interactions)
  $window,
  $body,
  $drawhere,
  $colour,
  $size,

  // draw here box
  drawWidth,
  drawHeight,
  drawX,
  drawY,

  // set up websockets
  socket = io.connect();

  // connection established
  socket.on('open', function (data) {
    log("remote", data);
  });

  // message received
  socket.on('click', function (data) {
    log("remote", data);
  });

  // connection closed
  socket.on('close', function (data) {
    log("remote", data);
  });


  // detect previous/next clicks
  function detectMouse() {
    $body     = $("body");
    $window   = $(window);
    $drawhere = $("#drawhere");

    $drawhere.on('mousedown', function(e){
      mouseDown = true;
    });

    $drawhere.on('mouseup', function(e){
      mouseDown = false;
    });

    $drawhere.on('mousemove', function(e){
      if (mouseDown) {
        sendMouse(e);
      }
    });

    // capture touch events
    $drawhere[0].addEventListener("touchstart", touchHandler, true);
    $drawhere[0].addEventListener("touchmove",  touchHandler, true);
    $drawhere[0].addEventListener("touchend",   touchHandler, true);
    $drawhere[0].addEventListener("touchcancel",touchHandler, true);

    setDimensions();
    $window.on('resize', setDimensions);
  }


  function setDimensions() {
    var drawherePos = $drawhere.offset();
    drawX      = drawherePos.left,
    drawY      = drawherePos.top,
    drawWidth  = $drawhere.width();
    drawHeight = $drawhere.height();
  }


  // send (and log) a message
  function sendMouse(e) {
    var mouse = {
      x:      (e.clientX - drawX)/drawWidth,
      y:      (e.clientY - drawY)/drawHeight,
      colour: $colour.val(),
      size:   $size.val()
    };
    socket.emit("mouse", mouse);
    log("mouse", mouse);
  }


  // log recieved messages
  function log(source, message) {
    //console.log(source + " message received: ", message);
  }


  /* colour picker */
    function createColourPicker() {
      $("#colour").spectrum({
        // flat: true,
        showInput: true,
        color:"#ff9900"
      });
      $colour = $(".sp-input");
    }


  /* slider */
    function createSlider() {
      var sliderOptions = {
            handles: 1,
            connect: "lower",
            scale: [1,20],
            start: 10,
            change: sliderUpdated,
            end: sliderUpdated
          };

      $body.find(".slider").noUiSlider('init', sliderOptions);
      $size = $("#size");
    }

    function sliderUpdated() {
      var val = $(this).noUiSlider('value')[1];
      $size.val(val);
    }


  /* rotate letters */
  function rotateLetters() {
    $("h1, h2").rotateLetters();
  }



  /*
   * iOS viewport fix
   * https://raw.github.com/gist/901295/bf9a44b636a522e608bba11a91b8298acd081f50/ios-viewport-scaling-bug-fix.js
   * By @mathias, @cheeaun and @jdalton
   */
  (function(){
    var addEvent = 'addEventListener',
        type = 'gesturestart',
        qsa = 'querySelectorAll',
        scales = [1, 1],
        meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

    function fix() {
      meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
      doc.removeEventListener(type, fix, true);
    }

    if ((meta = meta[meta.length - 1]) && addEvent in doc) {
      fix();
      scales = [0.25, 1.6];
      doc[addEvent](type, fix, true);
    }
  })();



  /*
   * http://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
   */
  function touchHandler(event) {
    var touches = event.changedTouches,
        first = touches[0],
        type = "";

    switch(event.type) {
        case "touchstart": type="mousedown"; break;
        case "touchmove":  type="mousemove"; break;
        case "touchend":   type="mouseup"; break;
        default: return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //           screenX, screenY, clientX, clientY, ctrlKey,
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
  }


}(document, $));