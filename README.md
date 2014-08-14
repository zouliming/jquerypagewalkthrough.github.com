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
        // Popup type - either modal, tooltip or nohighlight.
        // See [Popup Types](/pages/popup-types.html)
        type: 'modal',
        // Position for tooltip and nohighlight style popups - either top,
        // left, right or bottom
        position: 'top',
        // Horizontal offset for the walkthrough
        offsetHorizontal: 0,
        // Vertical offset for the walkthrough
        offsetVertical: 0,
        // Default width for each popup
        width: '320',
        // Amount in degrees to rotate the content by
        contentRotation: 0
      },
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
  // **(Required)** Walkthrough name.  Should be a unique name to identify the
  // walkthrough, as it will
  // be used in the cookie name
  name: null,
  // Automatically show the walkthrough when the page is loaded.  If multiple
  // walkthroughs set this to true, only the first walkthrough is shown
  // automatically
  onLoad: true,
  // Callback to be executed before the walkthrough is shown
  onBeforeShow: null,
  // Callback executed after the walkthrough is shown
  onAfterShow: null,
  // Callback executed in the event that 'restart' is triggered
  onRestart: null,
  // Callback executed when the walkthrough is closed.  The walkthrough can be
  // closed by the user clicking the close button in the top right, or
  // clicking the finish button on the last step
  onClose: null,
  // Callback executed when cookie has been set after a walkthrough has been
  // closed
  onCookieLoad: null,
  /* ##### <a name="controls-options">Walkthrough controls</a>
   *
   * Hash of buttons to show.  Object keys are used as the button element's ID
   */
  buttons: {
    // ID of the button
    jpwClose: {
      // Translation string for the button
      i18n: 'Click here to close',
      // Whether or not to show the button.  Can be a boolean value, or a
      // function which returns a boolean value
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

#### 14/08/2014

* `v2.5.0`: Remove draggable tooltip 'feature'
* `v2.4.0`: Remove defunct `accessible` and `overlay` options from step options
* `v2.3.8`: Fix clicks on tooltip content propagating through the DOM
* `v2.3.7`: Re-work of fix for issue #35, to make sure stuff behind the overlay cannot be clicked the second time a walkthrough is shown
* `v2.3.6`: Fix `onEnter` callback not firing if used with first step of a tour
* `v2.3.5`: Re-work fix for issue #36, original attempt at fixing in `v2.3.3`

#### 13/08/2014

* `v2.3.4`: Fix issue with auto-scrolling to a new target element when the element to scroll is already partly scrolled
* `v2.3.3`: Fix to prevent clicks on the overlay propagating, thus fixing issue where highlighted Bootstrap dropdowns and such would close
* `v2.3.2`: Fix overlays for popuip/tooltip content to prevent clicking things behind the walkthrough
* `v2.3.1`: Minor adjustment for more readable font-sizes
* `v2.3.0`: Fix the auto-scrolling behaviour so that it can scroll elements other than `body,html`
* `v2.2.1`: Moved the `onClose` callback to before the index reset, so close callbacks can access the last step index.

#### 12/08/2014

* `v2.2.0`: Remove support for `noHighlight` step types, add box-shadow based overlays
* `v2.1.3`: Make sure `wrapper` option selector is scoped to the current walkthrough's element, instead of being a document-wide selector
* `v2.1.2`: Fixes 2 bugs related to the `onClose` callback: 1) would not fire if walkthrough closed using `close` method, and 2) specifying an `onClose` callback would prevent
the default `close` behaviour from triggering, resulting in the walkthrough not being hidden

#### 07/08/2014

* `v2.1.1`: Fixes support for multiple walkthroughs, adds clearer method documentation and a basic test suite
* `v2.1.0`: Support for literal content in each step's `popup.content` option, instead of just a selector
* `v2.0.0`: Breaking changes to API - fix incorrect spelling of `accessable` to `accessible`; rename `stayFocus` to `lockScrolling`; remove deprecated methods
* `v1.4.0`: `name` is now a required option and **must be provided for all tours**
* `v1.3.0`: Deprecate `isPageWalkthroughActive` function in favour of `isActive` function

#### 05/08/2014

* `v1.2.4`: Add an optional finish button to the last step of the tour

#### 04/08/2014

* `v1.2.3`: Hotfix for each step's options not correctly extending default options
* `v1.2.2`: Hotfix to make the plugin actually work
* `v1.2.1`: Bug fix
* `v1.2.0`: Remove demo/example related files from master branch; source files into src/; distribution files into dist/

#### 30/07/2014

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
