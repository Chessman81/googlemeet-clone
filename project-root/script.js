document.addEventListener('DOMContentLoaded', () => {
  // Landing page logic
  if (document.getElementById('newMeetingBtn')) {
    document.getElementById('newMeetingBtn').onclick = () => {
      const code = Math.random().toString(36).substr(2, 9);
      window.location.href = `meeting.html?code=${code}`;
    };
    document.getElementById('joinBtn').onclick = () => {
      const code = document.getElementById('codeInput').value.trim();
      if (code) window.location.href = `meeting.html?code=${code}`;
    };
    return;
  }

  // Meeting page logic
  if (!window.location.pathname.endsWith('meeting.html')) return;

  let localStream = null;
  let micOn = true;
  let videoOn = true;
  let handRaised = false;

  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const micBtn = document.getElementById('micBtn');
  const videoBtn = document.getElementById('videoBtn');
  const emojiBtn = document.getElementById('emojiBtn');
  const raiseHandBtn = document.getElementById('raiseHandBtn');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const hangupBtn = document.getElementById('hangupBtn');
  const chatBox = document.getElementById('chatBox');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const emojiOverlay = document.getElementById('emojiOverlay');
  const meetingCode = document.getElementById('meetingCode');
  const localAvatar = document.getElementById('localAvatar');
  const remoteAvatar = document.getElementById('remoteAvatar');

  // Show meeting code
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (meetingCode) meetingCode.textContent = `Meeting Code: ${code || 'N/A'}`;

  // Start local media
  async function startLocalMedia() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideo.srcObject = localStream;
      micOn = true;
      videoOn = true;
      updateMicBtn();
      updateVideoBtn();
      showAvatar(localAvatar, false);
    } catch (err) {
      alert('Camera or microphone access denied.');
      showAvatar(localAvatar, true, "U");
    }
  }
  startLocalMedia();

  // UI helpers
  function updateMicBtn() {
    micBtn.querySelector('.material-icons').textContent = micOn ? "mic" : "mic_off";
    micBtn.classList.toggle("active", !micOn);
  }
  function updateVideoBtn() {
    videoBtn.querySelector('.material-icons').textContent = videoOn ? "videocam" : "videocam_off";
    videoBtn.classList.toggle("active", !videoOn);
    showAvatar(localAvatar, !videoOn, "U");
  }
  function showAvatar(avatarDiv, show, initials = "U") {
    avatarDiv.style.display = show ? "flex" : "none";
    avatarDiv.textContent = show ? initials : "";
  }

  // Mic toggle
  micBtn.onclick = () => {
    if (!localStream) return;
    micOn = !micOn;
    localStream.getAudioTracks().forEach(track => track.enabled = micOn);
    updateMicBtn();
  };

  // Video toggle
  videoBtn.onclick = () => {
    if (!localStream) return;
    videoOn = !videoOn;
    localStream.getVideoTracks().forEach(track => track.enabled = videoOn);
    updateVideoBtn();
  };

  // Emoji picker (simple prompt for demo)
  emojiBtn.onclick = () => {
    const emoji = prompt("Enter an emoji to send (e.g., 😀, 🎉, 👍):");
    if (emoji) {
      showEmoji(emoji);
      appendChatMessage('me', emoji);
      // In a real app, send emoji via data channel
    }
  };
  function showEmoji(emoji) {
    emojiOverlay.textContent = emoji;
    emojiOverlay.classList.add("show");
    setTimeout(() => emojiOverlay.classList.remove("show"), 1500);
  }

  // Raise hand
  raiseHandBtn.onclick = () => {
    handRaised = !handRaised;
    raiseHandBtn.classList.toggle("raised", handRaised);
    if (handRaised) {
      appendChatMessage('me', '✋ (raised hand)');
      // In a real app, notify others
    }
  };

  // Hang up
  hangupBtn.onclick = () => {
    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
    }
    alert('You have left the meeting.');
    window.location.href = 'index.html';
  };

  // Chat toggle
  chatToggleBtn.onclick = () => {
    chatBox.classList.toggle('hidden');
    setTimeout(() => chatInput.focus(), 200);
  };
  if (closeChatBtn) closeChatBtn.onclick = () => chatBox.classList.add('hidden');

  // Chat send
  chatForm.onsubmit = (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    appendChatMessage('me', msg);
    chatInput.value = '';
    // In a real app, send message via data channel
  };
  function appendChatMessage(sender, message) {
    const div = document.createElement('div');
    div.className = 'chat-bubble' + (sender === 'me' ? ' me' : '');
    div.innerHTML = message;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
