/* global document */
/**
 * @file WebRTC client implementation for browser environment
 */

import { env } from 'process';
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

// Browser environment check
if (typeof window === 'undefined') {
  throw new Error('This code must run in a browser environment');
}

const socket = io(env.PORT);
const peer = new SimplePeer({
  initiator: false,
  trickle: false
});

// UI Functions
function showIncomingCallUI(callerName) {
  // Create or show incoming call UI
  const callUI = document.createElement('div');
  callUI.innerHTML = `
    <h3>Incoming call from ${callerName}</h3>
    <button onclick="answerCall('${callerName}')">Answer</button>
    <button onclick="rejectCall()">Reject</button>
  `;
  document.body.appendChild(callUI);
}

function updateCallUI(status) {
  // Update call status UI
  const statusElement = document.querySelector('.call-status');
  if (statusElement) {
    statusElement.textContent = `Call ${status}`;
  }
}

// Join private room
socket.emit('join_private', { userId: 'current-user-id' });

// Handle incoming calls
socket.on('call_user', ({ signal, from, name }) => {
  // Show incoming call UI
  showIncomingCallUI(name);
  
  // Accept call
  peer.signal(signal);
});

// Handle call accepted
socket.on('call_accepted', (signal) => {
  peer.signal(signal);
});

// Handle call ended
socket.on('call_ended', () => {
  // Update UI to show call ended
  updateCallUI('ended');
});

// Make a call
function makeCall(userToCall) {
  peer.on('signal', signal => {
    socket.emit('call_user', {
      userToCall,
      signalData: signal,
      from: 'current-user-id',
      name: 'Current User'
    });
  });
}

// Answer a call
function answerCall(to, signal) {
  socket.emit('answer_call', { to, signal });
}

// End a call
function endCall(callerId, receiverId, duration, type) {
  socket.emit('call_ended', { callerId, receiverId, duration, type });
}

// WebRTC peer events
peer.on('stream', stream => {
  // Handle incoming stream (remote video)
  const video = document.querySelector('video');
  video.srcObject = stream;
});

// Example usage:
// makeCall('user-to-call-id');
// answerCall('caller-id', signal);
// endCall('caller-id', 'receiver-id', 120, 'video'); 