import { useState, useEffect, useCallback, useRef } from 'react';
import { MEDIA_CONSTRAINTS } from '../utils';

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const streamRef = useRef(null);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        audio: devices.filter(device => device.kind === 'audioinput'),
        video: devices.filter(device => device.kind === 'videoinput'),
      });
    } catch (err) {
      console.error('Error getting devices:', err);
      setError('Failed to get media devices');
    }
  }, []);

  const initStream = useCallback(async (constraints = MEDIA_CONSTRAINTS) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      streamRef.current = stream;
      setError(null);
      
      const hasAudioTrack = stream.getAudioTracks().length > 0;
      const hasVideoTrack = stream.getVideoTracks().length > 0;
      setIsAudioEnabled(hasAudioTrack);
      setIsVideoEnabled(hasVideoTrack);

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(err.message);
      
      if (constraints.video && err.name === 'NotAllowedError') {
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ 
            audio: constraints.audio,
            video: false 
          });
          setLocalStream(audioOnlyStream);
          streamRef.current = audioOnlyStream;
          setIsVideoEnabled(false);
          setError('Video access denied, using audio only');
          return audioOnlyStream;
        } catch (audioErr) {
          setError('Failed to access both audio and video');
          throw audioErr;
        }
      }
      throw err;
    }
  }, []);

  const switchDevice = useCallback(async (deviceId, kind) => {
    try {
      const newConstraints = { ...MEDIA_CONSTRAINTS };
      if (kind === 'audioinput') {
        newConstraints.audio = { ...newConstraints.audio, deviceId };
      } else if (kind === 'videoinput') {
        newConstraints.video = { ...newConstraints.video, deviceId };
      }
      await initStream(newConstraints);
    } catch (err) {
      console.error('Error switching device:', err);
      setError(`Failed to switch ${kind}`);
    }
  }, [initStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  }, [localStream]);

  useEffect(() => {
    getDevices();
    initStream();

    const handleDeviceChange = () => {
      getDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [getDevices, initStream]);

  return {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    error,
    devices,
    toggleAudio,
    toggleVideo,
    switchDevice,
    reinitializeStream: initStream,
  };
};
