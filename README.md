# js-lambda

Current state: pre-beta.

Natively JavaScript lacks the ability to pause/resume code with minimal functionality to retrieve and store state of executing code.

js-lambda is aimed at providing a managed code style lambda execution engine within JavaScript for JavaScript code.

Compilation of code into executable workers is done via the js-lambda package in node.js, with the output designed to run in node.js, a browser, or in another JavaScript execution environment while adding basic calls for use by a managed code engine such as `.run()`, `.restart()`, `.pause()`, `.resume()`, `.getState()`, and `.restoreState()` along with the ability to place breakpoints for debugging by extracting the abstract syntax tree of the code to be managed, modifying it with hooks to allow for events and interrupts, and recompiling into a functionally-identical set of managed code.
