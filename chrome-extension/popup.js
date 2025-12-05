// Popup script for Intervize Video Extension
document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const infoDiv = document.getElementById('info');
  const startWebcamBtn = document.getElementById('startWebcam');
  const stopWebcamBtn = document.getElementById('stopWebcam');
  const startRecordingBtn = document.getElementById('startRecording');
  const stopRecordingBtn = document.getElementById('stopRecording');

  let isWebcamActive = false;
  let isRecording = false;

  // Update status display
  function updateStatus(active, recording = false) {
    isWebcamActive = active;
    isRecording = recording;

    if (active) {
      statusDiv.className = 'status active';
      statusDiv.textContent = recording ? 'Status: Recording' : 'Status: Webcam Active';
    } else {
      statusDiv.className = 'status inactive';
      statusDiv.textContent = 'Status: Inactive';
    }

    startWebcamBtn.disabled = active;
    stopWebcamBtn.disabled = !active;
    startRecordingBtn.disabled = !active || recording;
    stopRecordingBtn.disabled = !recording;
  }

  // Send message to content script
  function sendToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        if (chrome.runtime.lastError) {
          infoDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }

        if (response) {
          infoDiv.textContent = 'Response: ' + JSON.stringify(response);
        }
      });
    });
  }

  // Button event listeners
  startWebcamBtn.addEventListener('click', function() {
    sendToContentScript({
      type: 'START_WEBCAM',
      constraints: {
        video: { width: 1280, height: 720 },
        audio: true
      }
    });
  });

  stopWebcamBtn.addEventListener('click', function() {
    sendToContentScript({ type: 'STOP_WEBCAM' });
  });

  startRecordingBtn.addEventListener('click', function() {
    sendToContentScript({
      type: 'START_RECORDING',
      options: { mimeType: 'video/webm;codecs=vp9,opus' }
    });
  });

  stopRecordingBtn.addEventListener('click', function() {
    sendToContentScript({ type: 'STOP_RECORDING' });
  });

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
      case 'WEBCAM_STARTED':
        updateStatus(true);
        infoDiv.textContent = 'Webcam started successfully';
        break;
      case 'WEBCAM_STOPPED':
        updateStatus(false);
        infoDiv.textContent = 'Webcam stopped';
        break;
      case 'RECORDING_STARTED':
        updateStatus(true, true);
        infoDiv.textContent = 'Recording started';
        break;
      case 'RECORDING_STOPPED':
        updateStatus(true, false);
        infoDiv.textContent = 'Recording stopped';
        break;
      case 'WEBCAM_ERROR':
        infoDiv.textContent = 'Error: ' + request.error;
        updateStatus(false);
        break;
    }
  });

  // Initialize status
  updateStatus(false);
});
