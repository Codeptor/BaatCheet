import { useRef, useEffect, useCallback } from 'react';
import { ICE_SERVERS } from '../utils';

export const useWebRTC = (localStream, onRemoteStream) => {
  const peerConnectionRef = useRef();

  const createPeerConnection = useCallback((onIceCandidate) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream, onRemoteStream]);

  const handleOffer = useCallback(async (offer, onAnswer) => {
    try {
      const pc = createPeerConnection((candidate) => {
        onAnswer({ type: 'ice-candidate', candidate });
      });
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      onAnswer({ type: 'answer', answer });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [createPeerConnection]);

  const initiateCall = useCallback(async (onSignal) => {
    try {
      const pc = createPeerConnection((candidate) => {
        onSignal({ type: 'ice-candidate', candidate });
      });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      onSignal({ type: 'offer', offer });
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (answer) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, []);

  return {
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  };
};
