###### Issues overview
[![Issues ready to be worked on](https://badge.waffle.io/warby-/jquery-pagewalkthrough.svg?label=ready&title=Ready%20To%20Work%20On)](http://waffle.io/warby-/jquery-pagewalkthrough)
[![Issues being worked on](https://badge.waffle.io/warby-/jquery-pagewalkthrough.svg?label=In%20Progress&title=In%20Progress)](http://waffle.io/warby-/jquery-pagewalkthrough)

# jQuery Page Walkthrough

Forked from [jpadamsonline/jquerypagewalkthrough.github.com](https://github.com/jpadamsonline/jquerypagewalkthrough.github.com)

Page Walkthrough is a flexible system for designing interactive, multimedia, educational walkthroughs.

## Screenshots

### Modal-style tour step
![Modal-style step](assets/screenshot_modal.png 'Modal-style step')

### Tooltip-style tour step with highlighted content
![Tooltip-style step](assets/screenshot_tooltip.png 'Tooltip-style step')

## Demo site

The demo site is located [here](http://warby-.github.io/jquery-pagewalkthrough/).

## Installing

1. Download the release you want from the [releases page](https://github.com/warby-/jquery-pagewalkthrough/releases), or download the
[latest code](https://github.com/warby-/jquery-pagewalkthrough/archive/master.zip)(may not be stable).
2. Extract the files from the `dist/` folder into your project
3. Include the stylesheets and JS (**note: include jQuery first**):

```html
<!-- CSS -->
<link type="text/css" rel="stylesheet" href="path/to/extracted/files/css/jquery.pagewalkthrough.css" />

<!-- jQuery -->
<script type="text/javascript" src="path/to/jquery/jquery-<jquery_version>.js"></script>
<!-- Page walkthrough plugin -->
<script type="text/javascript" src="path/to/extracted/files/jquery.pagewalkthrough.js"></script>
```

**Note: there are minified versions of the JS and CSS files available for production, with the suffixes `.min.js` and `.min.css` respectively.**

## Usage

@TODO

## jQuery Page Walkthrough Default Options

**Note:** as of version 1.4, you **must** specify a tour name in the options.

**Note:** as of version 2.1, the `popup.content` option for each step can now be the literal content for the step, or a selector as before.  The rule
for how the plugin decides which to treat it as is simple: if the string is a valid selector, and the selector matches an element that is already present
in the DOM, the matched element's content is displayed; if it is an invalid selector, or a selector which returns no matches, the literal value is displayed.

```javascript
steps: [
  {
    wrapper: '', //an ID of page element HTML that you want to highlight
    margin: 0, //margin for highlighted area, may use CSS syntax i,e: '10px 20px 5px 30px'
    popup: {
      content: '', // Literal string content for the step, or a selector for which to pull the HTML from (see note above)
      type: 'modal', //tooltip, modal, nohighlight
      position: 'top', //position for tooltip and nohighlight type only: top, right, bottom, left
      offsetHorizontal: 0, //horizontal offset for the walkthrough
      offsetVertical: 0, //vertical offset for the walkthrough
      width: '320', //default width for each step,
      draggable: false, // set true to set walkthrough draggable,
      contentRotation: 0 //content rotation : i.e: 0, 90, 180, 270 or whatever value you add. minus sign (-) will be CCW direction
    },
    overlay: true,
    accessible: false, //if true - you can access html element such as form input field, button etc
    autoScroll: true, //is true - this will autoscroll to the arrow/content every step
    scrollSpeed: 1000, //scroll speed
    lockScrolling: false, //if true - when user scroll down/up to the page, it will scroll back the position it belongs
    onLeave: null, // callback when leaving the step
    onEnter: null // callback when entering the step
  }
],
name: null, // the ID for this walkthrough (**MUST** be provided)
onLoad: true, //load the walkthrough at first time page loaded
onBeforeShow: null, //callback before page walkthrough loaded
onAfterShow: null, // callback after page walkthrough loaded
onRestart: null, //callback for onRestart walkthrough
onClose: null, //callback page walkthrough closed
onCookieLoad: null, //when walkthrough closed, it will set cookie and use callback if you want to create link to trigger to reopen the walkthrough,
/* Hash of buttons to show.  Object keys are used as the button element's ID.
 * Each button has the following structure:
 *   {
 *     i18n: {String}            The html for the button
 *     show: {Boolean|Function}  Whether to show the button or not.  Can be
 *                               a boolean, or a function which returns a
 *                               boolean.
 *   }
 */
buttons: {
  jpwClose: {
    i18n: 'Click here to close',
    show: true
  },
  jpwNext: {
    i18n: 'Next &rarr;',
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
```

## Public Methods

In general, calling methods on an element collection is preferred as it removes
any ambiguity about the walkthrough the method is affecting.

Calling methods with `$.pagewalkthrough(method, args...)` is supported, and will
operate on the currently active walkthrough if there is one. If no walkthroughs
are active, calling methods in this way will return boolean `false`.

### pagewalkthrough(options)

Creates a new walkthrough for a given element collection. Creating walkthroughs
by calling `$.pagewalkthrough` is no longer supported.

    $('body').pagewalkthrough(options);

**Note**: The walkthrough is defined on the *first* element in a collection - if
this element is removed before the walkthrough is shown, the walkthrough will
not display.

### show([name])

Starts a predefined walkthrough.

    // Show a walkthrough defined on a collection
    $('body').pagewalkthrough('show');
    // Show a walkthrough defined by a name
    $.pagewalkthrough('show', 'test');

### next()

Moves to the next step in a walkthrough, if there is one.

    // Move to the next step on a collection
    $('body').pagewalkthrough('next');
    // Move to the next step of the active walkthrough
    $.pagewalkthrough('next');

### prev()

Moves to the previous step in a walkthrough, if there is one.

    // Move to the previous step on a collection
    $('body').pagewalkthrough('prev');
    // Move to the previous step of the active walkthrough
    $.pagewalkthrough('prev')

### restart()

Moves to the first step in a walkthrough.

    // Move to the first step on a collection
    $('body').pagewalkthrough('restart');
    // Move to the first step of the active walkthrough
    $.pagewalkthrough('restart');

### close()

Closes the walkthrough.

    // Close a walkthrough on a collection
    $('body').pagewalkthrough('close');
    // Close the active walkthrough
    $.pagewalkthrough('close');

### isActive([name])

If called on the global jQuery object, the optional `name` argument
restricts the check to a specific walkthrough.

    // Returns whether *any* walkthrough is active
    $.pagewalkthrough('isActive');
    // Returns whether a specific walkthrough is active
    $.pagewalkthrough('isActive', 'test');

If called on an element collection, the `name` argument is ignored.

    // Returns whether the walkthrough defined on the collection is active
    $('body').pagewalkthrough('isActive');

### currIndex([name])

If called on the global jQuery object, the optional `name` argument
restricts the check to a specific walkthrough.

    // Returns the current index for the active walkthrough, or false
    // if no walkthrough is active
    $.pagewalkthrough('currIndex');
    // Returns the current index for a specific walkthrough, or false
    // if the walkthrough is not active
    $.pagewalkthrough('isActive', 'test');

If called on an element collection, the `name` argument is ignored.

    // Returns the current index, or false if the walkthrough is not active
    $('body').pagewalkthrough('currIndex');

### getOptions([activeWalkthrough])

Returns the options for all wakthroughs, unless the `activeWalkthrough` is
`true`, in which case it returns the options for the currently active
walkthrough. If no walkthrough is active, it returns `false`.

    // Returns options for all defined walkthroughs
    $.pagewalkthrough('getOptions');
    // Returns options for the currently active walkthroughs
    $.pagewalkthrough('getOptions', true);

If called on an element collection, the `activeWalkthrough` argument is ignored
and it returns the options for the specific walkthrough.

    // Returns options for this specific walkthrough
    $('body').pagewalkthrough('getOptions');

## Contributing

### Building

The `build` script in `bin/build` can be used to update the distribution files found in `dist/`.  The build script has two dependencies (see below section).
Once these two dependencies are met, just run `./bin/build` from the top-level directory of the repository to update everything in `dist/`.

#### Build script dependencies

For the build script to run, you will need the programs `less` (for compiling the LESS into CSS, and for creating the minified CSS - you'd need this
anyway if you had modified the LESS during development), and `uglifyjs` (for creating the minified JS).  The easiest way to install these dependencies
is through `node` and `npm`:

```shell
npm install -g less
npm install -g uglify-js
```

### Code style

There is no formally defined code style, so just try and stick to what is already there for the time being.  The code is due a major refactor and tidy-up anyway.  The only "hard"
rule is stick to 2 space tabs.  Also try to stick to lines which are less than 80 characters long.

Also note that the CSS pre-processor [lesscss](http://lesscss.org/) is used in this project - don't modify the CSS files directly, as your changes will be overwritten when the LESS
is compiled.  Instead, you should modify the LESS and compile it (see the section on 'Building' above).

## Browser Support

### Desktop

- IE8+
- Firefox
- Safari
- Chrome (**Note: Chrome does not support cookies from locally run files.  If you want to test or develop against this aspect of the project, you should host the project on a local server**)

### Mobile

@TODO - untested as of yet

## Theme

@TODO - not yet implemented

## Changelog

### 12/08/2014

* `v2.2.1`: Moved the `onClose` callback to before the index reset, so close callbacks can access the last step index.
* `v2.2.0`: Remove support for `noHighlight` step types, add box-shadow based overlays
* `v2.1.3`: Make sure `wrapper` option selector is scoped to the current walkthrough's element, instead of being a document-wide selector
* `v2.1.2`: Fixes 2 bugs related to the `onClose` callback: 1) would not fire if walkthrough closed using `close` method, and 2) specifying an `onClose` callback would prevent
the default `close` behaviour from triggering, resulting in the walkthrough not being hidden

### 07/08/2014

* `v2.1.1`: Fixes support for multiple walkthroughs, adds clearer method documentation and a basic test suite
* `v2.1.0`: Support for literal content in each step's `popup.content` option, instead of just a selector
* `v2.0.0`: Breaking changes to API - fix incorrect spelling of `accessable` to `accessible`; rename `stayFocus` to `lockScrolling`; remove deprecated methods
* `v1.4.0`: `name` is now a required option and **must be provided for all tours**
* `v1.3.0`: Deprecate `isPageWalkthroughActive` function in favour of `isActive` function

### 05/08/2014

* `v1.2.4`: Add an optional finish button to the last step of the tour

### 04/08/2014

* `v1.2.3`: Hotfix for each step's options not correctly extending default options
* `v1.2.2`: Hotfix to make the plugin actually work
* `v1.2.1`: Bug fix
* `v1.2.0`: Remove demo/example related files from master branch; source files into src/; distribution files into dist/

### 30/07/2014

* `v1.1.4`: Add option to make close button optional
* `v1.1.3`: Support for showing next and previous buttons to move between tour stops
* `v1.1.2`: i18n support for close button text

## Contributors

### Author

* Erwin Yusrizal

### Maintainers

* James Warwood <james.duncan.1991@googlemail.com>
* Craig Roberts <craig0990@googlemail.com>

### Contributors

* Tai Nguyen
* JP Adams <jpadamsonline@gmail.com>
* James West <jwwest@gmail.com>
