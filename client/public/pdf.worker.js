/* PDF.js worker stub file */
self.onmessage = function(event) {
  postMessage({
    type: 'workerStub',
    message: 'PDF worker initialized'
  });
};
