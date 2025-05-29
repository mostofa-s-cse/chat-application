import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CallState {
  isCallActive: boolean;
  isIncomingCall: boolean;
  caller: string | null;
  callType: 'audio' | 'video' | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const initialState: CallState = {
  isCallActive: false,
  isIncomingCall: false,
  caller: null,
  callType: null,
  localStream: null,
  remoteStream: null,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setCallActive: (state, action: PayloadAction<boolean>) => {
      state.isCallActive = action.payload;
    },
    setIncomingCall: (state, action: PayloadAction<boolean>) => {
      state.isIncomingCall = action.payload;
    },
    setCaller: (state, action: PayloadAction<string | null>) => {
      state.caller = action.payload;
    },
    setCallType: (state, action: PayloadAction<'audio' | 'video' | null>) => {
      state.callType = action.payload;
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.remoteStream = action.payload;
    },
    resetCall: (state) => {
      return initialState;
    },
  },
});

export const {
  setCallActive,
  setIncomingCall,
  setCaller,
  setCallType,
  setLocalStream,
  setRemoteStream,
  resetCall,
} = callSlice.actions;

export default callSlice.reducer; 