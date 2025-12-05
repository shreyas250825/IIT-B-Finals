// Injected script for Intervize Video Extension
// This script runs in the page context and communicates with the content script

(function() {
  'use strict';

  // Global object for the extension API
  window.IntervizeVideo = {
    init: function() {
      window.postMessage({ type: 'INTERVIZE_INIT' }, '*');
      return new Promise((resolve) => {
        const handler = (event) => {
          if (event.data.type === 'INTERVIZE_READY') {
            window.removeEventListener('message', handler);
            resolve();
          }
        };
        window.addEventListener('message', handler);
      });
    },

    startWebcam: function(constraints) {
      window.postMessage({
        type: 'INTERVIZE_START_WEBCAM',
        constraints: constraints
      }, '*');

      return new Promise((resolve, reject) => {
        const handler = (event) => {
          if (event.data.type === 'INTERVIZE_WEBCAM_READY') {
            window.removeEventListener('message', handler);
            resolve(event.data.stream);
          } else if (event.data.type === 'INTERVIZE_WEBCAM_ERROR') {
            window.removeEventListener('message', handler);
            reject(new Error(event.data.error));
          }
        };
        window.addEventListener('message', handler);
      });
    },

    stopWebcam: function() {
      window.postMessage({ type: 'INTERVIZE_STOP_WEBCAM' }, '*');
    },

    startRecording: function(options) {
      window.postMessage({
        type: 'INTERVIZE_START_RECORDING',
        options: options
      }, '*');
    },

    stopRecording: function() {
      window.postMessage({ type: 'INTERVIZE_STOP_RECORDING' }, '*');

      return new Promise((resolve) => {
        const handler = (event) => {
          if (event.data.type === 'INTERVIZE_RECORDING_STOPPED') {
            window.removeEventListener('message', handler);
            resolve(event.data.chunks);
          }
        };
        window.addEventListener('message', handler);
      });
    },

    onWebcamReady: function(callback) {
      const handler = (event) => {
        if (event.data.type === 'INTERVIZE_WEBCAM_READY') {
          callback(event.data.stream);
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    },

    onRecordingData: function(callback) {
      const handler = (event) => {
        if (event.data.type === 'INTERVIZE_RECORDING_DATA') {
          callback(event.data.chunks);
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
  };

  // Auto-initialize if we're on the interview page
  if (window.location.pathname.includes('/interview') ||
      document.querySelector('[data-intervize-init]')) {
    window.IntervizeVideo.init();
  }

})();
