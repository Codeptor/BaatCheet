import { useRef, useEffect, useCallback, useState } from 'react';
import { ICE_SERVERS } from '../utils';

const CONNECTION_STATE = {
  NEW: 'new',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
};

export const useWebRTC = (localStream, onRemoteStream) => {
  const peerConnectionRef = useRef();
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATE.NEW);
  const [stats, setStats] = useState(null);
  const statsIntervalRef = useRef();

  const monitorConnectionStats = useCallback(async (pc) => {
    if (!pc) return;
    
    try {
      const stats = await pc.getStats();
      const statsData = {
        bytesReceived: 0,
        bytesSent: 0,
        packetsLost: 0,
        roundTripTime: 0,
      };

      stats.forEach(report => {
        if (report.type === 'inbound-rtp') {
          statsData.bytesReceived += report.bytesReceived;
          statsData.packetsLost += report.packetsLost;
        } else if (report.type === 'outbound-rtp') {
          statsData.bytesSent += report.bytesSent;
        } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          statsData.roundTripTime = report.currentRoundTripTime;
        }
      });

      setStats(statsData);
    } catch (error) {
      console.error('Error monitoring stats:', error);
    }
  }, []);

  const createPeerConnection = useCallback((onIceCandidate) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    setConnectionStatus(CONNECTION_STATE.NEW);

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
      switch (pc.iceConnectionState) {
        case 'checking':
          setConnectionStatus(CONNECTION_STATE.CONNECTING);
          break;
        case 'connected':
        case 'completed':
          setConnectionStatus(CONNECTION_STATE.CONNECTED);
          clearInterval(statsIntervalRef.current);
          statsIntervalRef.current = setInterval(() => monitorConnectionStats(pc), 1000);
          break;
        case 'failed':
          setConnectionStatus(CONNECTION_STATE.FAILED);
          clearInterval(statsIntervalRef.current);
          break;
        case 'disconnected':
          setConnectionStatus(CONNECTION_STATE.DISCONNECTED);
          clearInterval(statsIntervalRef.current);
          break;
        default:
          break;
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        onIceCandidate({ type: 'offer', offer: pc.localDescription });
      } catch (error) {
        console.error('Error during negotiation:', error);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream, onRemoteStream, monitorConnectionStats]);

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
      setConnectionStatus(CONNECTION_STATE.FAILED);
      throw new Error(`Failed to handle offer: ${error.message}`);
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
      setConnectionStatus(CONNECTION_STATE.FAILED);
      throw new Error(`Failed to initiate call: ${error.message}`);
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
      setConnectionStatus(CONNECTION_STATE.FAILED);
      throw new Error(`Failed to handle answer: ${error.message}`);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  const cleanup = useCallback(() => {
    clearInterval(statsIntervalRef.current);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setConnectionStatus(CONNECTION_STATE.DISCONNECTED);
    setStats(null);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    connectionStatus,
    stats,
    cleanup,
  };
};
