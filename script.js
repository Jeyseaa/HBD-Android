document.addEventListener('DOMContentLoaded', function() {
  // Check for browser support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('getUserMedia is not supported in this browser');
    return;
  }

  // Request microphone access
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      // Create an AudioContext
      var audioContext = new (window.AudioContext || window.webkitAudioContext)();
      var analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      // Connect the microphone stream to the analyser
      var microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      // Analyser setup
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      // Function to detect blowing
      function detectBlow() {
        analyser.getByteFrequencyData(dataArray);

        // Analyze dataArray to detect blowing
        if (isBlowDetected(dataArray)) {
          console.log('Blow detected!');
        }

        // Repeat the detection
        requestAnimationFrame(detectBlow);
      }

      // Start blow detection
      detectBlow();
    })
    .catch(function(err) {
      console.error('Error accessing microphone:', err);
    });
});

// Function to detect blowing
function isBlowDetected(audioData) {
  // Calculate the average amplitude of the frequency data
  var sum = audioData.reduce((acc, val) => acc + val, 0);
  var averageAmplitude = sum / audioData.length;

  // Define a threshold amplitude level (adjust as needed)
  var threshold = 100;

  // Check if the average amplitude exceeds the threshold
  return averageAmplitude > threshold;
}
