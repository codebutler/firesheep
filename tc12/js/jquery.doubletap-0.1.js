(function($) {
  var touchStatus = function(target, touch) {
    this.target    = $(target);
    this.touch     = touch;
    this.startX    = this.currentX = touch.screenX;
    this.startY    = this.currentY = touch.screenY;
    this.eventType = null;
  }
  touchStatus.latestTap = null;

  touchStatus.prototype.move = function(touch) {
    this.currentX = touch.screenX;
    this.currentY = touch.screenY;
  }

  touchStatus.prototype.process = function() {
    var offsetX = this.currentX - this.startX;
    var offsetY = this.currentY - this.startY;
    if(offsetX == 0 && offsetY == 0) {
      this.checkForDoubleTap()
    } else if(Math.abs(offsetY) > Math.abs(offsetX)) {
      this.eventType = offsetY > 0 ? 'swipedown' : 'swipeup';
      this.target.trigger('swipe', [this])
    } else {
      this.eventType = offsetX > 0 ? 'swiperight' : 'swipeleft';
      this.target.trigger('swipe', [this])
    }
    this.target.trigger(this.eventType, [this])
    this.target.trigger('touch',        [this])
  }

  touchStatus.prototype.checkForDoubleTap = function() {
    if(touchStatus.latestTap) {
      if((new Date() - touchStatus.latestTap) < 400) 
        this.eventType = 'doubletap'
    }
    if(!this.eventType) this.eventType = 'tap'
    touchStatus.latestTap = new Date()
  }

  var swipeEvents = function(elements) {
    elements.bind('touchstart',  this.touchStart);
    elements.bind('touchmove',   this.touchMove);
    elements.bind('touchcancel', this.touchCancel);
    elements.bind('touchend',    this.touchEnd);
  }

  swipeEvents.prototype.touchStart = function(evt) {
    var target = this;
    swipeEvents.eachTouch(evt, function(touch) {
      swipeEvents.touches[touch.identifier] = new touchStatus(target, touch);
    })
  }

  swipeEvents.prototype.touchMove = function(evt) {
    swipeEvents.eachTouch(evt, function(touch) {
      var loc = swipeEvents.touches[touch.identifier]
      if(loc) loc.move(touch)
    })
  }

  swipeEvents.prototype.touchCancel = function(evt) {
    swipeEvents.eachTouch(evt, function(touch) {
      swipeEvents.purge(touch, true)
    })
  }

  swipeEvents.prototype.touchEnd = function(evt) {
    swipeEvents.eachTouch(evt, function(touch) {
      swipeEvents.purge(touch)
    })
  }

  swipeEvents.touches = {}
  swipeEvents.purge = function(touch, cancelled) {
    if(!cancelled) {
      var loc = swipeEvents.touches[touch.identifier]
      if(loc) loc.process()
    }
    delete swipeEvents.touches[touch.identifier]
  }

  swipeEvents.eachTouch = function(evt, callback) {
    var evt = evt.originalEvent;
    var num = evt.changedTouches.length;
    for(var i = 0; i < num; i++) {
      callback(evt.changedTouches[i])
    }
  }

  // adds custom events:
  //   touch      // all events
  //   swipe      // only swipe* events
  //   swipeleft
  //   swiperight
  //   swipeup
  //   swipedown
  //   tap
  //   doubletap
  $.fn.addSwipeEvents = function(callback) {
    new swipeEvents(this);
    if(callback) this.bind('touch', callback)
    return this;
  }
})(jQuery);