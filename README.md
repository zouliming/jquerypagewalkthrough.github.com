[![Stories in Ready](https://badge.waffle.io/warby-/jquerypagewalkthrough.github.com.png?label=ready&title=Ready)](https://waffle.io/warby-/jquerypagewalkthrough.github.com)
jQuery Page Walkthrough
================================

Forked from [jpadamsonline/jquerypagewalkthrough.github.com](https://github.com/jpadamsonline/jquerypagewalkthrough.github.com)

Page Walkthrough is a flexible system for designing interactive, multimedia, educational walkthroughs.

## Example

To view jQuery Page Walkthrough example <a href="example/example.html">Click Here</a>

## Screenshots

### Modal-style tour step
![Modal-style step](images/screenshot_modal.png 'Modal-style step')

### Tooltip-style tour step with highlighted content
![Tooltip-style step](images/screenshot_tooltip.png 'Tooltip-style step')

## Install

```html
<!-- CSS -->
<link type="text/css" rel="stylesheet" href="css/jquery.pagewalkthrough.css" />

<!-- JQUERY -->
<script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="js/jquery.pagewalkthrough-1.1.0.js"></script>
```

## jQuery Page Walkthrough Default Options

```javascript
steps: [

  {
        wrapper: '', //an ID of page element HTML that you want to highlight
        margin: 0, //margin for highlighted area, may use CSS syntax i,e: '10px 20px 5px 30px' or '20px 20px' and so on
        popup:
            {
              content: '', //ID content of the walkthrough
              type: 'modal', //tooltip, modal, nohighlight
              position:'top',//position for tooltip and nohighlight type only: top, right, bottom, left
              offsetHorizontal: 0, //horizontal offset for the walkthrough
              offsetVertical: 0, //vertical offset for the walkthrough
              width: '320', //default width for each step,
              draggable: false, // set true to set walkthrough draggable,
              contentRotation: 0 //content rotation : i.e: 0, 90, 180, 270 or whatever value you add. minus sign (-) will be CCW direction
           },
        overlay: true, //use overlay or not, default: true
        accessable: false, //if true - you can access html element such as form input field, button etc
        autoScroll: true, //is true - this will autoscroll to the arror/content every step
        scrollSpeed: 1000, //scroll speed
        stayFocus: false, //if true - when user scroll down/up to the page, it will scroll back the position it belongs
        onLeave: null, // callback when leaving the step
        onEnter: null // callback when entering the step,
        showNextButton: true, // Show the next button for all steps except the last step
        showPreviousButton: true, // Show the previous button for all steps except the first step
        i18n: { // Strings for the user interface
            close: 'Click here to close', // Default text for the close button in the top right corner
            next: 'Next &rarr;', // Default text for the next button
            previous: '&larr; Previous' // Default text for the previous button
        }
  }

],
name: null, // the ID for this walkthrough
onLoad: true, //load the walkthrough at first time page loaded
onBeforeShow: null, //callback before page walkthrough loaded
onAfterShow: null, // callback after page walkthrough loaded
onRestart: null, //callback for onRestart walkthrough
onClose: null, //callback page walkthrough closed
onCookieLoad: null //when walkthrough closed, it will set cookie and tells the walkthrough to not load automaticly
```

## Public Methods

```
show       :   $.pagewalkthrough('show', target)
This method allows you to open page walkthrough. Target is your walkthrough ID, i.e: #selector

next       :   $.pagewalkthrough('next', event)
This method allows you to go the NEXT step. Event is needed as a param to call next method

prev       :   $.pagewalkthrough('prev', event)
This method allows you to go the PREVIOUS step. Event is needed as a param to call prev method

restart    :   $.pagewalkthrough('restart', event)
This method allows you to go the RESTART step. Event is needed as a param to call restart method

close      :   $.pagewalkthrough('close', target)
This method allows you to go the CLOSE step. Target is optional. It could be filled with walkthrough ID or leave it blank

isPageWalkthroughActive   :   $.pagewalkthrough('isPageWalkthroughActive')
This property will return status of page walkthrough

currIndex  :   $.pagewalkthrough('currIndex')
This property will return current index of current walkthrough step
```

## Browser Support

IE7+, Firefox (Win &amp; Mac), Safari (Win &amp; Mac), Chrome (Win &amp; Mac)

**Note:** Because chrome doesn't support running cookie in local file, if you want to test this plugin on chrome, you should run this plugin from webserver i.e: wamp, mamp, etc

## Theme

Will be added soon...

## Changelog

### 30/07/2014

* i18n support for close button text
* Support for showing next and previous buttons to move between tour stops
