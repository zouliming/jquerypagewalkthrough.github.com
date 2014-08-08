/***
 * Author: Erwin Yusrizal
 * UX by: Tai Nguyen
 * Contributors: James West <jwwest@gmail.com>
 *               JP Adams <jpadamsonline@gmail.com>
 *               James Warwood <james.duncan.1991@googlemail.com>
 *               Craig Roberts <craig0990@googlemail.com>
 * Created On: 27/02/2013
 * Version: 2.1.0
 * Issue, Feature & Bug Support: https://github.com/warby-/jquery-pagewalkthrough/issues
 ***/

;(function($, window, document, undefined) {

  /**
   * GLOBAL VAR
   */
  var _globalWalkthrough = {},
    _elements = [],
    _activeWalkthrough,
    _activeId,
    _hasDefault = true,
    _counter = 0,
    _isCookieLoad,
    _firstTimeLoad = true,
    _onLoad = true,
    _index = 0,
    _id = 0, // Counter for default walkthrough IDs
    _isWalkthroughActive = true,
    $jpwOverlay = $('<div id="jpwOverlay"></div>'),
    $jpWalkthrough = $('<div id="jpWalkthrough"></div>'),
    $jpwTooltip = $('<div id="jpwTooltip"></div>');

  /**
   * PUBLIC METHOD
   */

  var methods = {
    isActive: function() {
      return !!_isWalkthroughActive;
    },

    currIndex: function() {
      return _index;
    },

    //init method
    init: function(options) {
      var options = $.extend(true, {}, $.fn.pagewalkthrough.defaults, options);
      var that = this;

      if (!options.name) {
        throw new Error('Must provide a unique name for a tour');
      }

      return this.each(function(i) {
        var $this = $(this);

        options = options || {};
        options.elementID = options.name;

        _globalWalkthrough[options.name] = options;
        _elements.push(options.name);

        //check if onLoad and this is first time load
        if (options.onLoad) {
          _counter++;
        }

        //get first onload = true
        if (_counter == 1 && _onLoad) {
          _activeId = options.name;
          _activeWalkthrough = _globalWalkthrough[_activeId];
          _onLoad = false;
        }

        // set the activeWalkthrough if onLoad is false for all walkthroughs
        if ((i + 1 === that.length && _counter == 0)) {
          _activeId = options.name;
          _activeWalkthrough = _globalWalkthrough[_elements[0]];
          _hasDefault = false;
        }

        // when user scroll the page, scroll it back to keep walkthrough on user view
        $(window).scroll(function() {
          if (_isWalkthroughActive && _activeWalkthrough.steps[_index].lockScrolling) {
            clearTimeout($.data(this, 'scrollTimer'));
            $.data(this, 'scrollTimer', setTimeout(function() {
              scrollToTarget(_activeWalkthrough);
            }, 250));
          }

          return false;
        });
      });
    },

    renderOverlay: function() {

      //if each walkthrough has onLoad = true, throw warning message to the console
      if (_counter > 1) {
        debug('Warning: Only first walkthrough will be shown onLoad as default');
      }

      //get cookie load
      _isCookieLoad = getCookie('_walkthrough-' + _activeId);

      //check if first time walkthrough
      if (_isCookieLoad == undefined) {
        _isWalkthroughActive = true;
        buildWalkthrough();
        showButton('jpwClose', 'body');

        scrollToTarget();

        setTimeout(function() {
          //call onAfterShow callback
          if (isFirstStep() && _firstTimeLoad) {
            if (!onAfterShow()) return;
          }
        }, 100);
      } else { //check when user used to close the walkthrough to call the onCookieLoad callback
        onCookieLoad(_globalWalkthrough);
      }
    },

    restart: function(e) {
      if (isFirstStep()) return;

      _index = 0;
      if (!(onRestart(e))) return;
      if (!(onEnter(e))) return;
      buildWalkthrough();

      scrollToTarget();

    },

    close: function(target) {

      _index = 0;
      _firstTimeLoad = true;

      _isWalkthroughActive = false;

      if (target) {
        //set cookie to false
        setCookie('_walkthrough-' + target, 0, 365);
        _isCookieLoad = getCookie('_walkthrough-' + target);
      } else {
        //set cookie to false
        setCookie('_walkthrough-' + _activeId, 0, 365);
        _isCookieLoad = getCookie('_walkthrough-' + _activeId);
      }

      $jpwOverlay.fadeOut('slow', function() {
        $(this).remove();
      });

      $jpWalkthrough.fadeOut('slow', function() {
        $(this).html('').remove();
      });

      $('#jpwClose').fadeOut('slow', function() {
        $(this).remove();
      });

    },

    show: function(target) {
      _isWalkthroughActive = true;
      _firstTimeLoad = true;
      // @FIXME: need to figure what's actually going on in terms of deciding
      // which walkthrough to show - the below is a hotfix to get the plugin
      // actually working
      _activeId = target || _activeId;
      _activeWalkthrough = _globalWalkthrough[_activeId];

      buildWalkthrough();
      showButton('jpwClose', 'body');

      scrollToTarget();

      //call onAfterShow callback
      if (isFirstStep() && _firstTimeLoad) {
        if (!onAfterShow()) return;
      }

    },

    next: function(e) {
      _firstTimeLoad = false;
      if (isLastStep()) return;

      if (!onLeave(e)) return;
      _index = parseInt(_index) + 1;
      if (!onEnter(e)) return;
      buildWalkthrough();

      scrollToTarget();

    },

    prev: function(e) {
      if (isFirstStep()) return;

      if (!onLeave(e)) return;
      _index = parseInt(_index) - 1;
      if (!onEnter(e)) return;
      buildWalkthrough();

      scrollToTarget();
    },

    getOptions: function(activeWalkthrough) {
      var _wtObj;

      //get only current active walkthrough
      if (activeWalkthrough) {
        _wtObj = {};
        _wtObj = _activeWalkthrough;
        //get all walkthrough
      } else {
        _wtObj = [];
        for (var wt in _globalWalkthrough) {
          _wtObj.push(_globalWalkthrough[wt]);
        }
      }

      return _wtObj;
    }
  }; //end public method


  /*
   * BUILD OVERLAY
   */

  function buildWalkthrough() {
    var options = _activeWalkthrough;

    //call onBeforeShow callback
    if (isFirstStep() && _firstTimeLoad) {
      if (!onBeforeShow()) return;
    }

    // Extend step options with defaults
    options.steps[_index] = $.extend(
        true, {}, $.fn.pagewalkthrough.defaults.steps[0], options.steps[_index]
    );

    if (options.steps[_index].popup.type != 'modal' && options.steps[_index].popup.type != 'nohighlight') {

      $jpWalkthrough.html('');

      //check if wrapper is not empty or undefined
      if (options.steps[_index].wrapper == '' || options.steps[_index].wrapper == undefined) {
        alert('Your walkthrough position is: "' + options.steps[_index].popup.type + '" but wrapper is empty or undefined. Please check your "' + _activeId + '" wrapper parameter.');
        return;
      }

      var topOffset = cleanValue($(options.steps[_index].wrapper).offset().top);
      var leftOffset = cleanValue($(options.steps[_index].wrapper).offset().left);
      var transparentWidth = cleanValue($(options.steps[_index].wrapper).innerWidth()) || cleanValue($(options.steps[_index].wrapper).width());
      var transparentHeight = cleanValue($(options.steps[_index].wrapper).innerHeight()) || cleanValue($(options.steps[_index].wrapper).height());

      //get all margin and make it gorgeous with the 'px', if it has no px, IE will get angry !!
      var marginTop = cssSyntax(options.steps[_index].margin, 'top'),
        marginRight = cssSyntax(options.steps[_index].margin, 'right'),
        marginBottom = cssSyntax(options.steps[_index].margin, 'bottom'),
        marginLeft = cssSyntax(options.steps[_index].margin, 'left'),
        roundedCorner = 30,
        overlayClass = '',
        killOverlay = '';

      var overlayTopStyle = {
        'height': cleanValue(parseInt(topOffset) - (parseInt(marginTop) + (roundedCorner)))
      }

      var overlayLeftStyle = {
        'top': overlayTopStyle.height,
        'width': cleanValue(parseInt(leftOffset) - (parseInt(marginLeft) + roundedCorner)),
        'height': cleanValue(parseInt(transparentHeight) + (roundedCorner * 2) + parseInt(marginTop) + parseInt(marginBottom))
      }


      //check if use overlay
      if (options.steps[_index].overlay == undefined || options.steps[_index].overlay) {
        overlayClass = 'overlay';
      } else {
        overlayClass = 'noOverlay';
        killOverlay = 'killOverlay';
      }

      var overlayTop = $('<div id="overlayTop" class="' + overlayClass + '"></div>').css(overlayTopStyle).appendTo($jpWalkthrough);
      var overlayLeft = $('<div id="overlayLeft" class="' + overlayClass + '"></div>').css(overlayLeftStyle).appendTo($jpWalkthrough);

      if (!options.steps[_index].accessible) {

        var highlightedAreaStyle = {
          'top': overlayTopStyle.height,
          'left': overlayLeftStyle.width,
          'topCenter': {
            'width': cleanValue(parseInt(transparentWidth) + parseInt(marginLeft) + parseInt(marginRight))
          },
          'middleLeft': {
            'height': cleanValue(parseInt(transparentHeight) + parseInt(marginTop) + parseInt(marginBottom))
          },
          'middleCenter': {
            'width': cleanValue(parseInt(transparentWidth) + parseInt(marginLeft) + parseInt(marginRight)),
            'height': cleanValue(parseInt(transparentHeight) + parseInt(marginTop) + parseInt(marginBottom))
          },
          'middleRight': {
            'height': cleanValue(parseInt(transparentHeight) + parseInt(marginTop) + parseInt(marginBottom))
          },
          'bottomCenter': {
            'width': cleanValue(parseInt(transparentWidth) + parseInt(marginLeft) + parseInt(marginRight))
          }
        }

        var highlightedArea = $('<div id="highlightedArea"></div>').css(highlightedAreaStyle).appendTo($jpWalkthrough);

        highlightedArea.html('<div>' +
          '<div id="topLeft" class="' + killOverlay + '"></div>' +
          '<div id="topCenter" class="' + killOverlay + '" style="width:' + highlightedAreaStyle.topCenter.width + ';"></div>' +
          '<div id="topRight" class="' + killOverlay + '"></div>' +
          '</div>' +

        '<div style="clear: left;">' +
          '<div id="middleLeft" class="' + killOverlay + '" style="height:' + highlightedAreaStyle.middleLeft.height + ';"></div>' +
          '<div id="middleCenter" class="' + killOverlay + '" style="width:' + highlightedAreaStyle.middleCenter.width + ';height:' + highlightedAreaStyle.middleCenter.height + '">&nbsp;</div>' +
          '<div id="middleRight" class="' + killOverlay + '" style="height:' + highlightedAreaStyle.middleRight.height + ';"></div>' +
          '</div>' +

        '<div style="clear: left;">' +
          '<div id="bottomLeft" class="' + killOverlay + '"></div>' +
          '<div id="bottomCenter" class="' + killOverlay + '" style="width:' + highlightedAreaStyle.bottomCenter.width + ';"></div>' +
          '<div id="bottomRight" class="' + killOverlay + '"></div>' +
          '</div>');
      } else {

        //if accessible
        var highlightedAreaStyle = {
          'top': overlayTopStyle.height,
          'left': overlayLeftStyle.width,
          'topCenter': {
            'width': cleanValue(parseInt(transparentWidth) + parseInt(marginLeft) + parseInt(marginRight))
          }
        }

        var accessibleStyle = {

          'topAccessible': {
            'position': 'absolute',
            'top': overlayTopStyle.height,
            'left': overlayLeftStyle.width,
            'topCenter': {
              'width': cleanValue(parseInt(transparentWidth) + parseInt(marginLeft) + parseInt(marginRight))
            }
          },
          'middleAccessible': {
            'position': 'absolute',
            'top': cleanValue(parseInt(overlayTopStyle.height) + roundedCorner),
            'left': overlayLeftStyle.width,
            'middleLeft': {
              'height': cleanValue(parseInt(transparentHeight) + parseInt(marginTop) + parseInt(marginBottom))
            },
            'middleRight': {
              'height': cleanValue(parseInt(transparentHeight) + parseInt(marginTop) + parseInt(marginBottom)),
              'right': cleanValue(parseInt(transparentWidth) + roundedCorner + parseInt(marginRight) + parseInt(marginLeft))
            }
          },
          'bottomAccessible': {
            'left': overlayLeftStyle.width,
            'top': cleanValue(parseInt(overlayTopStyle.height) + roundedCorner + parseInt(transparentHeight) + parseInt(marginTop) + parseInt(marginBottom)),
            'bottomCenter': {
              'width': cleanValue(parseInt(transparentWidth) + parseInt(marginLeft) + parseInt(marginRight))
            }
          }
        }

        var highlightedArea = $('<div id="topAccessible" style="position:' + accessibleStyle.topAccessible.position + '; top:' + accessibleStyle.topAccessible.top + ';left:' + accessibleStyle.topAccessible.left + '">' +
          '<div id="topLeft" class="' + killOverlay + '"></div>' +
          '<div id="topCenter" class="' + killOverlay + '" style="width:' + accessibleStyle.topAccessible.topCenter.width + '"></div>' +
          '<div id="topRight" class="' + killOverlay + '"></div>' +
          '</div>' +

        '<div id="middleAccessible" class="' + killOverlay + '" style="clear: left;position:' + accessibleStyle.middleAccessible.position + '; top:' + accessibleStyle.middleAccessible.top + ';left:' + accessibleStyle.middleAccessible.left + ';">' +
          '<div id="middleLeft" class="' + killOverlay + '" style="height:' + accessibleStyle.middleAccessible.middleLeft.height + ';"></div>' +
          '<div id="middleRight" class="' + killOverlay + '" style="position:absolute;right:-' + accessibleStyle.middleAccessible.middleRight.right + ';height:' + accessibleStyle.middleAccessible.middleRight.height + ';"></div>' +
          '</div>' +

        '<div id="bottomAccessible" style="clear: left;position:absolute;left:' + accessibleStyle.bottomAccessible.left + ';top:' + accessibleStyle.bottomAccessible.top + ';">' +
          '<div id="bottomLeft" class="' + killOverlay + '"></div>' +
          '<div id="bottomCenter" class="' + killOverlay + '" style="width:' + accessibleStyle.bottomAccessible.bottomCenter.width + ';"></div>' +
          '<div id="bottomRight" class="' + killOverlay + '"></div>' +
          '</div>').appendTo($jpWalkthrough);

      } //end checking accessible

      var highlightedAreaWidth = (options.steps[_index].accessible) ? parseInt(accessibleStyle.topAccessible.topCenter.width) + (roundedCorner * 2) : (parseInt(highlightedAreaStyle.topCenter.width) + (roundedCorner * 2));


      var overlayRightStyle = {
        'left': cleanValue(parseInt(overlayLeftStyle.width) + highlightedAreaWidth),
        'height': overlayLeftStyle.height,
        'top': overlayLeftStyle.top,
        'width': cleanValue(windowWidth() - (parseInt(overlayLeftStyle.width) + highlightedAreaWidth))
      }

      var overlayRight = $('<div id="overlayRight" class="' + overlayClass + '"></div>').css(overlayRightStyle).appendTo($jpWalkthrough);

      var overlayBottomStyle = {
        'height': cleanValue($(document).height() - (parseInt(overlayTopStyle.height) + parseInt(overlayLeftStyle.height))),
        'top': cleanValue(parseInt(overlayTopStyle.height) + parseInt(overlayLeftStyle.height))
      }

      var overlayBottom = $('<div id="overlayBottom" class="' + overlayClass + '"></div>').css(overlayBottomStyle).appendTo($jpWalkthrough);



      if ($('#jpWalkthrough').length) {
        $('#jpWalkthrough').remove();
      }

      $jpWalkthrough.appendTo('body').show();

      if (options.steps[_index].accessible) {
        showTooltip(true);
      } else {
        showTooltip(false);
      }


    } else if (options.steps[_index].popup.type == 'modal') {

      if ($('#jpWalkthrough').length) {
        $('#jpWalkthrough').remove();
      }

      if (options.steps[_index].overlay == undefined || options.steps[_index].overlay) {
        showModal(true);
      } else {
        showModal(false);
      }

    } else {
      if ($('#jpWalkthrough').length) {
        $('#jpWalkthrough').remove();
      }


      if (options.steps[_index].overlay == undefined || options.steps[_index].overlay) {
        noHighlight(true);
      } else {
        noHighlight(false);
      }
    }

    showButton('jpwPrevious');
    showButton('jpwNext');
    showButton('jpwFinish');
  }

  /*
   * SHOW MODAL
   */

  function showModal(isOverlay) {
    var options = _activeWalkthrough,
      overlayClass = '',
      content;

    if (isOverlay) {
      $jpwOverlay.appendTo('body').show();
    } else {
      if ($('#jpwOverlay').length) {
        $('#jpwOverlay').remove();
      }
    }

    var textRotation = setRotation(parseInt(options.steps[_index].popup.contentRotation));

    $jpwTooltip.css({
      'position': 'absolute',
      'left': '50%',
      'top': '20%',
      'margin-left': -(parseInt(options.steps[_index].popup.width) + 60) / 2 + 'px',
      'z-index': '9999'
    });

    var tooltipSlide = $('<div id="tooltipTop">' +
      '<div id="topLeft"></div>' +
      '<div id="topRight"></div>' +
      '</div>' +

    '<div id="tooltipInner">' +
      '</div>' +

    '<div id="tooltipBottom">' +
      '<div id="bottomLeft"></div>' +
      '<div id="bottomRight"></div>' +
      '</div>');

    $jpWalkthrough.html('');
    $jpwTooltip.html('').append(tooltipSlide)
      .wrapInner('<div id="tooltipWrapper" style="width:' + cleanValue(parseInt(options.steps[_index].popup.width) + 30) + '"></div>')
      .append('<div id="bottom-scratch"></div>')
      .appendTo($jpWalkthrough);

    $jpWalkthrough.appendTo('body');

    $('#tooltipWrapper').css(textRotation);

    $('#tooltipInner').append(getContent(options.steps[_index])).show();

    $jpwTooltip.css('margin-top', -(($jpwTooltip.height()) / 2) + 'px');
    $jpWalkthrough.show();
  }


  /*
   * SHOW TOOLTIP
   */

  function showTooltip(isAccessible) {
    var opt = _activeWalkthrough;

    var tooltipWidth = (opt.steps[_index].popup.width == '') ? 300 : opt.steps[_index].popup.width,
      top, left, arrowTop, arrowLeft,
      roundedCorner = 30,
      overlayHoleWidth = (isAccessible) ? ($('#topAccessible').innerWidth() + (roundedCorner * 2)) || ($('#topAccessible').width() + (roundedCorner * 2)) : $('#highlightedArea').innerWidth() || $('#highlightedArea').width(),
      overlayHoleHeight = (isAccessible) ? $('#middleAccessible').innerHeight() + (roundedCorner * 2) || $('#middleAccessible').height() + (roundedCorner * 2) : $('#highlightedArea').innerHeight() || $('#highlightedArea').height(),
      overlayHoleTop = (isAccessible) ? $('#topAccessible').offset().top : $('#highlightedArea').offset().top,
      overlayHoleLeft = (isAccessible) ? $('#topAccessible').offset().left : $('#highlightedArea').offset().left,
      arrow = 30,
      draggable = '';

    var textRotation = (opt.steps[_index].popup.contentRotation == undefined || parseInt(opt.steps[_index].popup.contentRotation) == 0) ? clearRotation() : setRotation(parseInt(opt.steps[_index].popup.contentRotation));


    //delete jwOverlay if any
    if ($('#jpwOverlay').length) {
      $('#jpwOverlay').remove();
    }

    var tooltipSlide = $('<div id="tooltipTop">' +
      '<div id="topLeft"></div>' +
      '<div id="topRight"></div>' +
      '</div>' +

    '<div id="tooltipInner">' +
      '</div>' +

    '<div id="tooltipBottom">' +
      '<div id="bottomLeft"></div>' +
      '<div id="bottomRight"></div>' +
      '</div>');

    $jpwTooltip.html('').css({
      'margin-left': '0',
      'margin-top': '0',
      'position': 'absolute',
      'z-index': '9999'
    })
      .append(tooltipSlide)
      .wrapInner('<div id="tooltipWrapper" style="width:' + cleanValue(parseInt(opt.steps[_index].popup.width) + 30) + '"></div>')
      .appendTo($jpWalkthrough);

    if (opt.steps[_index].popup.draggable) {
      $jpwTooltip.append('<div id="drag-area" class="draggable-area"></div>');
    }

    $jpWalkthrough.appendTo('body').show();

    $('#tooltipWrapper').css(textRotation);

    $('#tooltipInner').append(getContent(opt.steps[_index])).show();

    $jpwTooltip.append('<span class="' + opt.steps[_index].popup.position + '">&nbsp;</span>');

    switch (opt.steps[_index].popup.position) {

      case 'top':
        top = overlayHoleTop - ($jpwTooltip.height() + (arrow / 2)) + parseInt(opt.steps[_index].popup.offsetVertical) - 86;
        if (isAccessible) {
          left = (overlayHoleLeft + (overlayHoleWidth / 2)) - ($jpwTooltip.width() / 2) - 40 + parseInt(opt.steps[_index].popup.offsetHorizontal);
        } else {
          left = (overlayHoleLeft + (overlayHoleWidth / 2)) - ($jpwTooltip.width() / 2) - 5 + parseInt(opt.steps[_index].popup.offsetHorizontal);
        }
        arrowLeft = ($jpwTooltip.width() / 2) - arrow;
        arrowTop = '';
        break;
      case 'right':
        top = overlayHoleTop - (arrow / 2) + parseInt(opt.steps[_index].popup.offsetVertical);
        left = overlayHoleLeft + overlayHoleWidth + (arrow / 2) + parseInt(opt.steps[_index].popup.offsetHorizontal) + 105;
        arrowTop = arrow;
        arrowLeft = '';
        break;
      case 'bottom':

        if (isAccessible) {
          top = (overlayHoleTop + overlayHoleHeight) + parseInt(opt.steps[_index].popup.offsetVertical) + 86;
          left = (overlayHoleLeft + (overlayHoleWidth / 2)) - ($jpwTooltip.width() / 2) - 40 + parseInt(opt.steps[_index].popup.offsetHorizontal);
        } else {
          top = overlayHoleTop + overlayHoleHeight + parseInt(opt.steps[_index].popup.offsetVertical) + 86;
          left = (overlayHoleLeft + (overlayHoleWidth / 2)) - ($jpwTooltip.width() / 2) - 5 + parseInt(opt.steps[_index].popup.offsetHorizontal);
        }

        arrowLeft = ($jpwTooltip.width() / 2) - arrow;
        arrowTop = '';
        break;
      case 'left':
        top = overlayHoleTop - (arrow / 2) + parseInt(opt.steps[_index].popup.offsetVertical);
        left = overlayHoleLeft - $jpwTooltip.width() - (arrow) + parseInt(opt.steps[_index].popup.offsetHorizontal) - 105;
        arrowTop = arrow;
        arrowLeft = '';
        break;
    }

    $('#jpwTooltip span.' + opt.steps[_index].popup.position).css({
      'left': cleanValue(arrowLeft)
    });

    $jpwTooltip.css({
      'top': cleanValue(top),
      'left': cleanValue(left)
    });
    $jpWalkthrough.show();
  }

  /* Get the content for a step.  First attempts to treat step.popup.content
   * as a selector.  If this fails, or returns an empty result set, it falls
   * back to return the value of step.popup.content.
   *
   * This allows both selectors and literal content to be provided in the
   * content option.
   *
   * @param {Object} step  The step data to return the content for
   */
  function getContent(step) {
    var option = step.popup.content,
      content;

    try {
      content = $('body').find(option).html();
    } catch(e) {
    }

    return content || option;
  }

  /**
   * POPUP NO HIGHLIGHT
   */

  function noHighlight(isOverlay) {
    var opt = _activeWalkthrough,
      overlayClass = '';

    var wrapperTop = $(opt.steps[_index].wrapper).offset().top,
      wrapperLeft = $(opt.steps[_index].wrapper).offset().left,
      wrapperWidth = $(opt.steps[_index].wrapper).width(),
      wrapperHeight = $(opt.steps[_index].wrapper).height(),
      arrow = 30,
      draggable = '',
      top, left, arrowTop, arrowLeft;

    if (isOverlay) {
      $jpwOverlay.appendTo('body').show();
    } else {
      if ($('#jpwOverlay').length) {
        $('#jpwOverlay').remove();
      }
    }

    $jpwTooltip.css(clearRotation());

    var textRotation = (opt.steps[_index].popup.contentRotation == 'undefined' || opt.steps[_index].popup.contentRotation == 0) ? '' : setRotation(parseInt(opt.steps[_index].popup.contentRotation));

    $jpwTooltip.css({
      'position': 'absolute',
      'margin-left': '0px',
      'margin-top': '0px',
      'z-index': '9999'
    });

    var tooltipSlide = $('<div id="tooltipTop">' +
      '<div id="topLeft"></div>' +
      '<div id="topRight"></div>' +
      '</div>' +

    '<div id="tooltipInner">' +
      '</div>' +

    '<div id="tooltipBottom">' +
      '<div id="bottomLeft"></div>' +
      '<div id="bottomRight"></div>' +
      '</div>');

    $jpWalkthrough.html('');
    $jpwTooltip.html('').append(tooltipSlide)
      .wrapInner('<div id="tooltipWrapper" style="width:' + cleanValue(parseInt(opt.steps[_index].popup.width) + 30) + '"></div>')
      .appendTo($jpWalkthrough);

    if (opt.steps[_index].popup.draggable) {
      $jpwTooltip.append('<div id="drag-area" class="draggable-area"></div>');
    }

    $jpWalkthrough.appendTo('body');

    $('#tooltipWrapper').css(textRotation);

    $(opt.steps[_index].popup.content).clone().appendTo('#tooltipInner').show();

    $jpwTooltip.append('<span class="' + opt.steps[_index].popup.position + '">&nbsp;</span>');

    switch (opt.steps[_index].popup.position) {

      case 'top':
        top = wrapperTop - ($jpwTooltip.height() + (arrow / 2)) + parseInt(opt.steps[_index].popup.offsetVertical) - 86;
        left = (wrapperLeft + (wrapperWidth / 2)) - ($jpwTooltip.width() / 2) - 5 + parseInt(opt.steps[_index].popup.offsetHorizontal);
        arrowLeft = ($jpwTooltip.width() / 2) - arrow;
        arrowTop = '';
        break;
      case 'right':
        top = wrapperTop - (arrow / 2) + parseInt(opt.steps[_index].popup.offsetVertical);
        left = wrapperLeft + wrapperWidth + (arrow / 2) + parseInt(opt.steps[_index].popup.offsetHorizontal) + 105;
        arrowTop = arrow;
        arrowLeft = '';
        break;
      case 'bottom':
        top = wrapperTop + wrapperHeight + parseInt(opt.steps[_index].popup.offsetVertical) + 86;
        left = (wrapperLeft + (wrapperWidth / 2)) - ($jpwTooltip.width() / 2) - 5 + parseInt(opt.steps[_index].popup.offsetHorizontal);
        arrowLeft = ($jpwTooltip.width() / 2) - arrow;
        arrowTop = '';
        break;
      case 'left':
        top = wrapperTop - (arrow / 2) + parseInt(opt.steps[_index].popup.offsetVertical);
        left = wrapperLeft - $jpwTooltip.width() - (arrow) + parseInt(opt.steps[_index].popup.offsetHorizontal) - 105;
        arrowTop = arrow;
        arrowLeft = '';
        break;
    }

    $('#jpwTooltip span.' + opt.steps[_index].popup.position).css({
      'left': cleanValue(arrowLeft)
    });

    $jpwTooltip.css({
      'top': cleanValue(top),
      'left': cleanValue(left)
    });
    $jpWalkthrough.show();


  }

  /*
   * SCROLL TO TARGET
   */

  function scrollToTarget() {

    var options = _activeWalkthrough;

    if (options.steps[_index].autoScroll || options.steps[_index].autoScroll == undefined) {
      if (options.steps[_index].popup.position != 'modal') {

        var windowHeight = $(window).height() || $(window).innerHeight(),
          targetOffsetTop = $jpwTooltip.offset().top,
          targetHeight = $jpwTooltip.height() || $jpwTooltip.innerHeight(),
          overlayTop = $('#overlayTop').height();

        $('html,body').animate({
          scrollTop: (targetOffsetTop + (targetHeight / 2) - (windowHeight / 2))
        }, options.steps[_index].scrollSpeed);

      } else {
        $('html,body').animate({
          scrollTop: 0
        }, options.steps[_index].scrollSpeed);
      }

    }
  }

  /* Render a control button outside the #tooltipInner element.
   *
   * @param {String} id               The button identifier within the
   *                                  options.buttons hash (e.g. 'jpwNext')
   * @param {jQuery|String} appendTo  (Optional) The element or selector to
   *                                  append the button to.  Defaults to
   *                                  #tooltipWrapper
   */
  function showButton(id, appendTo) {
    if ($('#' + id).length) return;

    var btn = _activeWalkthrough.buttons[id];

    appendTo = appendTo || '#tooltipWrapper';

    // Check that button is defined
    if (!btn) return;

    // Check that button should be shown
    if ((typeof btn.show === 'function' && !btn.show()) || !btn.show) {
      return;
    }

    // Append button
    $(appendTo).append($('<a />', {
      id: id,
      html: btn.i18n
    }));
  }

  /**
    /* CALLBACK
    /*/

  //callback for onLoadHidden cookie

  function onCookieLoad(options) {

    for (i = 0; i < _elements.length; i++) {
      if (typeof(options[_elements[i]].onCookieLoad) === "function") {
        options[_elements[i]].onCookieLoad.call(this);
      }
    }

    return false;
  }

  function onLeave(e) {
    var options = _activeWalkthrough;

    if (typeof options.steps[_index].onLeave === "function") {
      if (!options.steps[_index].onLeave.call(this, e, _index)) {
        return false;
      }
    }

    return true;

  }

  //callback for onEnter step

  function onEnter(e) {

    var options = _activeWalkthrough;

    if (typeof options.steps[_index].onEnter === "function") {
      if (!options.steps[_index].onEnter.call(this, e, _index)) {
        return false;
      }
    }

    return true;
  }

  //callback for onClose help

  function onClose() {
    var options = _activeWalkthrough;

    if (typeof options.onClose === "function") {
      if (!options.onClose.call(this)) {
        return false;
      }
    }

    //set help mode to false
    //_isWalkthroughActive = false;
    methods.close();

    return true;
  }

  //callback for onRestart help

  function onRestart(e) {
    var options = _activeWalkthrough;
    //set help mode to true
    _isWalkthroughActive = true;
    methods.restart(e);

    //auto scroll to target
    scrollToTarget();

    if (typeof options.onRestart === "function") {
      if (!options.onRestart.call(this)) {
        return false;
      }
    }

    return true;
  }

  //callback for before all first walkthrough element loaded

  function onBeforeShow() {
    var options = _activeWalkthrough || {};
    _index = 0;

    if (typeof(options.onBeforeShow) === "function") {
      if (!options.onBeforeShow.call(this)) {
        return false;
      }
    }

    return true;
  }

  //callback for after all first walkthrough element loaded

  function onAfterShow() {
    var options = _activeWalkthrough;
    _index = 0;

    if (typeof(options.onAfterShow) === "function") {
      if (!options.onAfterShow.call(this)) {
        return false;
      }
    }

    return true;
  }



  /**
   * HELPERS
   */

  function windowWidth() {
    return $(window).innerWidth() || $(window).width();
  }

  function debug(message) {
    if (window.console && window.console.log)
      window.console.log(message);
  }

  function clearRotation() {
    var rotationStyle = {
      '-webkit-transform': 'none', //safari
      '-moz-transform': 'none', //firefox
      '-ms-transform': 'none', //IE9+
      '-o-transform': 'none', //opera
      'filter': 'none', //IE7
      '-ms-transform': 'none' //IE8
    }

    return rotationStyle;
  }

  function setRotation(angle) {

    //for IE7 & IE8
    var M11, M12, M21, M22, deg2rad, rad;

    //degree to radian
    deg2rad = Math.PI * 2 / 360;
    rad = angle * deg2rad;

    M11 = Math.cos(rad);
    M12 = Math.sin(rad);
    M21 = Math.sin(rad);
    M22 = Math.cos(rad);

    var rotationStyle = {
      '-webkit-transform': 'rotate(' + parseInt(angle) + 'deg)', //safari
      '-moz-transform': 'rotate(' + parseInt(angle) + 'deg)', //firefox
      '-ms-transform': 'rotate(' + parseInt(angle) + 'deg)', //IE9+
      '-o-transform': 'rotate(' + parseInt(angle) + 'deg)', //opera
      'filter': 'progid:DXImageTransform.Microsoft.Matrix(M11 = ' + M11 + ',M12 = -' + M12 + ',M21 = ' + M21 + ',M22 = ' + M22 + ',sizingMethod = "auto expand");', //IE7
      '-ms-transform': 'progid:DXImageTransform.Microsoft.Matrix(M11 = ' + M11 + ',M12 = -' + M12 + ',M21 = ' + M21 + ',M22 = ' + M22 + ',SizingMethod = "auto expand");' //IE8
    }

    return rotationStyle;

  }

  function cleanValue(value) {
    if (typeof value === "string") {
      if (value.toLowerCase().indexOf('px') == -1) {
        return value + 'px';
      } else {
        return value;
      }
    } else {
      return value + 'px';
    }
  }

  function cleanSyntax(val) {

    if (val.indexOf('px') != -1) {
      return true;
    } else if (parseInt(val) == 0) {
      return true;
    }
    return false;
  }

  function cssSyntax(val, position) {
    if (!val) val = '0px';

    var value = val,
      arrVal = value.split(' '),
      counter = 0,
      top, right, bottom, left, returnVal;

    for (i = 0; i < arrVal.length; i++) {
      //check if syntax is clean with value and 'px'
      if (cleanSyntax(arrVal[i])) {
        counter++;
      }
    }

    //all syntax are clean
    if (counter == arrVal.length) {

      for (i = 0; i < arrVal.length; i++) {

        switch (i) {
          case 0:
            top = arrVal[i];
            break;
          case 1:
            right = arrVal[i];
            break;
          case 2:
            bottom = arrVal[i];
            break;
          case 3:
            left = arrVal[i];
            break;
        }

      }

      switch (arrVal.length) {
        case 1:
          right = bottom = left = top;
          break;
        case 2:
          bottom = top;
          left = right;
          break;
        case 3:
          left = right;
          break;
      }

      if (position == 'undefined' || position == '' || position == null) {
        console.log('Please define margin position (top, right, bottom, left)');
        return false;
      } else {

        switch (position) {
          case 'top':
            returnVal = top;
            break;
          case 'right':
            returnVal = right;
            break;
          case 'bottom':
            returnVal = bottom;
            break;
          case 'left':
            returnVal = left;
            break;
        }

      }

      return returnVal;

    } else {
      console.log('Please check your margin syntax..');
      return false;
    }
  }

  function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
  }

  function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
      x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
      y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
      x = x.replace(/^\s+|\s+$/g, "");
      if (x == c_name) {
        return unescape(y);
      }
    }
  }

  /* Returns true if the current step is the last step in the walkthrough.
   *
   * @return {Boolean} true if user is currently viewing last step; false
   *                   otherwise
   */
  function isLastStep() {
    return _index == (_activeWalkthrough.steps.length - 1);
  }

  /* Returns true if the current step is the first step in the walkthrough.
   *
   * @return {Boolean} true if user is currently viewing first step; false
   *                   otherwise
   */
  function isFirstStep() {
      return _index === 0;
  }

  /**
   * BUTTON CLOSE CLICK
   */

  /* Close and finish tour buttons clicks */
  $(document).on('click', '#jpwClose, #jpwFinish', onClose);

  /* Next button clicks
   */
  $(document).on('click', '#jpwNext', function() {
      $.pagewalkthrough('next');
  });

  /* Previous button clicks
   */
  $(document).on('click', '#jpwPrevious', function() {
      $.pagewalkthrough('prev');
  });

  /**
   * DRAG & DROP
   */

  // Patching for jquery 1.7+
  $(document).on('mousedown', '#jpwTooltip #drag-area', function(e) {
    if (!$(this).hasClass('draggable-area')) {
      return;
    }
    if (!$(this).hasClass('draggable')) {
      $(this).addClass('draggable').css('cursor', 'move');
    }

    var z_idx = $(this).css('z-index'),
      drg_h = $(this).outerHeight(),
      drg_w = $(this).outerWidth(),
      pos_y = $(this).offset().top + (drg_h * 2) - e.pageY - 10,
      pos_x = (e.pageX - $(this).offset().left + drg_w) - ($(this).parent().outerWidth() + drg_w) + 20;

    $(document).on("mousemove", function(e) {

      $('.draggable').parent().offset({
        top: e.pageY + pos_y - drg_h,
        left: e.pageX + pos_x - drg_w
      }).on("mouseup", function() {
        $(this).children('#tooltipWrapper').removeClass('draggable').css({
          'z-index': z_idx,
          'cursor': 'default'
        });
      });
    });
    e.preventDefault(); //disable selection
  });

  $(document).on('mouseup', '#jpwTooltip #drag-area', function() {
    $(this).removeClass('draggable').css('cursor', 'default');
  });

  /**
   * MAIN PLUGIN
   */
  $.pagewalkthrough = $.fn.pagewalkthrough = function(method) {

    if (methods[method]) {

      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

    } else if (typeof method === 'object' || !method) {

      methods.init.apply(this, arguments);

      // render the overlay on it has a default walkthrough set to show onload
      if (_hasDefault && _counter < 2) {
        setTimeout(function() {
          methods.renderOverlay();
        }, 500);
      }

    } else {

      $.error('Method ' + method + ' does not exist on jQuery.pagewalkthrough');

    }

  }

  /* #### <a name="default-options">Options</a>
   *
   * Default options for each walkthrough.
   * User options extend these defaults.
   */
  $.fn.pagewalkthrough.defaults = {
    /* Array of steps to show
     */
    steps: [
      {
        // jQuery selector for the element to highlight for this step
        wrapper: '',
        // Margin for highlighted element (use CSS syntax)
        margin: 0,
        // ##### <a name="popup-options">Popup options</a>
        popup: {
          // Selector for the element which contains the content, or the literal
          // content
          content: '',
          // Popup type - either modal, tooltip or nohighlight.  See [Popup Types](/pages/popup-types.html)
          type: 'modal',
          // Position for tooltip and nohighlight style popups - either top, left, right or bottom
          position: 'top',
          // Horizontal offset for the walkthrough
          offsetHorizontal: 0,
          // Vertical offset for the walkthrough
          offsetVertical: 0,
          // Default width for each popup
          width: '320',
          // If true, user can drag tooltip and no highlight style popups around
          draggable: false,
          // Amount in degrees to rotate the content by
          contentRotation: 0
        },
        // Whether the overlay should be shown or not
        overlay: true,
        // Allow user interaction with highlighted content - e.g. allow typing in inputs
        accessible: false,
        // Automatically scroll to the content for the step
        autoScroll: true,
        // Speed to use when scrolling to elements
        scrollSpeed: 1000,
        // Prevent the user from scrolling away from the content
        lockScrolling: false,
        // Callback when entering the step
        onEnter: null,
        // Callback when leaving the step
        onLeave: null
      }
    ],
    // **(Required)** Walkthrough name.  Should be a unique name to identify the walkthrough, as it will
    // be used in the cookie name
    name: null,
    // Automatically show the walkthrough when the page is loaded.  If multiple walkthroughs set this to
    // true, only the first walkthrough is shown automatically
    onLoad: true,
    // Callback to be executed before the walkthrough is shown
    onBeforeShow: null,
    // Callback executed after the walkthrough is shown
    onAfterShow: null,
    // Callback executed in the event that 'restart' is triggered
    onRestart: null,
    // Callback executed when the walkthrough is closed.  The walkthrough can be closed by the user
    // clicking the close button in the top right, or clicking the finish button on the last step
    onClose: null,
    // Callback executed when cookie has been set after a walkthrough has been closed
    onCookieLoad: null,
    /* ##### <a name="controls-options">Walkthrough controls</a>
     *
     * Hash of buttons to show.  Object keys are used as the button element's ID.
     */
    buttons: {
      // ID of the button
      jpwClose: {
        // Translation string for the button
        i18n: 'Click here to close',
        // Whether or not to show the button.  Can be a boolean value, or a function which returns
        // a boolean value
        show: true
      },
      jpwNext: {
        i18n: 'Next &rarr;',
        // Function which resolves to a boolean
        show: function() {
          return !isLastStep();
        }
      },
      jpwPrevious: {
        i18n: '&larr; Previous',
        show: function() {
          return !isFirstStep();
        }
      },
      jpwFinish: {
        i18n: 'Finish &#10004;',
        show: function() {
          return isLastStep();
        }
      }
    }
  };
}(jQuery, window, document));

