const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const timeLeftDisplay = document.querySelector('.time-left');
const timerInput = document.getElementById('timer-input');
const videoPlaceholder = document.querySelector('.video-placeholder');
const downloadBtn = document.querySelector('.download-btn');

let mediaRecorder;
let recordedChunks = [];
let stream;
let countdownInterval;

startBtn.addEventListener('click', async () => {
  const timeLimit = parseInt(timerInput.value);
  if (isNaN(timeLimit) || timeLimit <= 0) {
    alert("Please enter a valid timer value.");
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // Show live video
    videoPlaceholder.innerHTML = '';
    const liveVideo = document.createElement('video');
    liveVideo.srcObject = stream;
    liveVideo.autoplay = true;
    liveVideo.muted = true;
    liveVideo.style.width = '100%';
    liveVideo.style.borderRadius = '10px';
    videoPlaceholder.appendChild(liveVideo);

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);

      // Playback
      videoPlaceholder.innerHTML = '';
      const playbackVideo = document.createElement('video');
      playbackVideo.src = videoURL;
      playbackVideo.controls = true;
      playbackVideo.style.width = '100%';
      playbackVideo.style.borderRadius = '10px';
      videoPlaceholder.appendChild(playbackVideo);

      // Download
      downloadBtn.href = videoURL;
      downloadBtn.download = 'recording.webm';
      downloadBtn.textContent = 'Download Recording';
      downloadBtn.style.display = 'inline-block';
    };

    mediaRecorder.start();

    // Timer countdown
    let timeRemaining = timeLimit;
    timeLeftDisplay.textContent = `Time Left: ${formatTime(timeRemaining)}`;
    countdownInterval = setInterval(() => {
      timeRemaining--;
      timeLeftDisplay.textContent = `Time Left: ${formatTime(timeRemaining)}`;
      if (timeRemaining <= 0) {
        stopRecording();
      }
    }, 1000);
  } catch (error) {
    alert("Unable to access camera or microphone. Please check permissions.");
    console.error(error);
  }
});

stopBtn.addEventListener('click', stopRecording);

function stopRecording() {
  clearInterval(countdownInterval);
  timeLeftDisplay.textContent = `Time Left: 00:00`;

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}
