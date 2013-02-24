/*
 * Rotate and animate individual letters
 * @author petegoodman.com
 */
(function( $ ) {

  var

  //
  settings,

  // defaults to extend
  defaults = {
    'angle'     : 15,
    'duration'  : 1000,
    'delay'     : 100,
    'direction' : 'alternate',
    'timing'    : 'ease-in-out',
    'iteration' : 'infinite',
    'el'        : 'span',
    'className' : 'rotate'
  },

  // plugin methods
  methods = {

    //
    init : function( options ) {

      // extend defaults with any options that were provided
      settings = $.extend(defaults, options);

      // init
      return this.each(function() {

        var $this = $(this),
            charArray,
            wrappedText = "";

        // split every character into its own element
        charArray = this.innerHTML.split('');
        $.each(charArray, function(index, character){
          wrappedText += "<"+settings.el+" class='"+settings.className+"'>"+character+"</"+settings.el+">";
        });

        // insert all new elements in a single DOM call
        $this.html(wrappedText);

         var anim = CSSAnimations.create('rotate', {
           '0%'  : { 'transform': 'rotate(-'+settings.angle+'deg);', '-webkit-transform': 'rotate(-'+settings.angle+'deg);' },
           '100%': { 'transform': 'rotate( '+settings.angle+'deg);', '-webkit-transform': 'rotate( '+settings.angle+'deg);' }
         });

        $this.find('.'+settings.className).each(function(counter){
            $(this).css({
              'display' : 'inline-block',

              'animation-name'           : settings.className,
              'animation-duration'       : settings.duration + "ms",
              'animation-direction'      : settings.direction,
              'animation-timing-function': settings.timing,
              'animation-iteration-count': settings.iteration,
              'animation-delay'          : (counter * settings.delay) + "ms",
              '-webkit-animation-delay'  : (counter * settings.delay) + "ms"
            });
          });
      });
    },

    //
    stop : function( ) {

    }
  };


  $.fn.rotateLetters = function( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.rotateLetters' );
    }

  };
})( jQuery );






/*
 * https://github.com/jlongster/css-animations.js
 */
(function() {

    // Utility

    function findKeyframeRules(styles, func) {
        var rules = styles.cssRules || styles.rules || [];

        for(var i=0; i<rules.length; i++) {
            var rule = rules[i];

            if(rule.type == CSSRule.IMPORT_RULE) {
                findKeyframeRules(rule.styleSheet, func);
            }
            else if(rule.type === CSSRule.KEYFRAMES_RULE ||
                    rule.type === CSSRule.MOZ_KEYFRAMES_RULE ||
                    rule.type === CSSRule.WEBKIT_KEYFRAMES_RULE) {
                func(rule, styles, i);
            }
        }
    }

    // Classes

    function KeyframeRule(r) {
        this.original = r;
        this.keyText = r.keyText;
        this.css = {};

        // Extract the CSS as an object
        var rules = r.style.cssText.split(';');

        for(var i=0; i<rules.length; i++) {
            var parts = rules[i].split(':');

            if(parts.length == 2) {
                var key = parts[0].replace(/^\s+|\s+$/g, '');
                var value = parts[1].replace(/^\s+|\s+$/g, '');

                this.css[key] = value;
            }
        }
    }

    function KeyframeAnimation(kf) {
        this.original = kf;
        this.name = kf.name;
        this.keyframes = [];
        this.keytexts = [];
        this.keyframeHash = {};

        this.initKeyframes();
    }

    KeyframeAnimation.prototype.initKeyframes = function() {
        this.keyframes = [];
        this.keytexts = [];
        this.keyframeHash = {};

        var rules = this.original;

        for(var i=0; i<rules.cssRules.length; i++) {
            var rule = new KeyframeRule(rules.cssRules[i]);
            this.keyframes.push(rule);
            this.keytexts.push(rule.keyText);
            this.keyframeHash[rule.keyText] = rule;
        }
    };

    KeyframeAnimation.prototype.getKeyframeTexts = function() {
        return this.keytexts;
    };

    KeyframeAnimation.prototype.getKeyframe = function(text) {
        return this.keyframeHash[text];
    };

    KeyframeAnimation.prototype.setKeyframe = function(text, css) {
        var cssRule = text+" {";
        for(var k in css) {
            cssRule += k + ':' + css[k] + ';';
        }
        cssRule += "}";

        this.original.insertRule(cssRule);
        this.initKeyframes();

        // allow for chaining for ease of creation.
        return this;
    };

    KeyframeAnimation.prototype.setKeyframes = function(obj) {
        for(var k in obj) {
            this.setKeyframe(k, obj[k]);
        }
    };

    KeyframeAnimation.prototype.clear = function() {
        for(var i=0; i<this.keyframes.length; i++) {
            this.original.deleteRule(this.keyframes[i].keyText);
        }
    };

    function Animations() {
        this.animations = {};

        var styles = document.styleSheets;
        var anims = this.animations;

        for(var i=0; i<styles.length; i++) {
            try {
                findKeyframeRules(styles[i], function(rule) {
                    anims[rule.name] = new KeyframeAnimation(rule);
                });
            }
            catch(e) {
                // Trying to interrogate a stylesheet from another
                // domain will throw a security error
            }
        }
    }

    Animations.prototype.get = function(name) {
        return this.animations[name];
    };

    Animations.prototype.getDynamicSheet = function() {
        if(!this.dynamicSheet) {
            var style = document.createElement('style');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            this.dynamicSheet = style.sheet;
        }

        return this.dynamicSheet;
    };

    Animations.prototype.create = function(name, frames) {
        var styles = this.getDynamicSheet();

        // frames can also be passed as the first parameter
        if(typeof name === 'object') {
            frames = name;
            name = null;
        }

        if(!name) {
            name = 'anim' + Math.floor(Math.random() * 100000);
        }

        // Append a empty animation to the end of the stylesheet
        try {
            var idx = styles.insertRule('@keyframes ' + name + '{}',
                                        styles.cssRules.length);
        }
        catch(e) {
            if(e.name == 'SYNTAX_ERR' || e.name == 'SyntaxError') {
                try {
                  idx = styles.insertRule('@-webkit-keyframes ' + name + '{}',
                                        styles.cssRules.length);
                }
                catch(er) {
                  throw er;
                }
            }
            else {
                throw e;
            }
        }

        var anim = new KeyframeAnimation(styles.cssRules[idx]);
        this.animations[name] = anim;

        if(frames) {
            anim.setKeyframes(frames);
        }

        return anim;
    };

    Animations.prototype.remove = function(name) {
        var styles = this.getDynamicSheet();
        name = name instanceof KeyframeAnimation ? name.name : name;

        this.animations[name] = null;

        try {
            findKeyframeRules(styles, function(rule, styles, i) {
                if(rule.name == name) {
                    styles.deleteRule(i);
                }
            });
        }
        catch(e) {
            // Trying to interrogate a stylesheet from another
            // domain will throw a security error
        }
    };

    if(typeof define == 'function' && define.amd) {
        define(function() { return new Animations(); });
    }
    else {
        window.CSSAnimations = new Animations();
    }
})();