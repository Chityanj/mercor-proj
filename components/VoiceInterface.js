import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';

const VoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const silenceTimeoutRef = useRef(null);

  const { listen, stop } = useSpeechRecognition({
    onResult: result => {
      setTranscription(result);
      resetSilenceTimeout();
      startSilenceTimeout();
    },
  });

  useEffect(() => {
    if (isListening) {
      listen();
      startSilenceTimeout();
    } else {
      stop();
      resetSilenceTimeout();
    }
  }, [isListening]);

  const startSilenceTimeout = () => {
    silenceTimeoutRef.current = setTimeout(() => {
      setIsListening(false);
      console.log('Recording stopped after detecting silence.');
    }, 5000);
  };

  const resetSilenceTimeout = () => {
    clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = null;
  };

  const handleStartListening = () => {
    setIsListening(true);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  return (
    <div>
      <button onClick={handleStartListening} disabled={isListening}>
        Start Listening
      </button>
      <button onClick={handleStopListening} disabled={!isListening}>
        Stop Listening
      </button>
      <p>Transcription: {transcription}</p>
    </div>
  );
};

export default VoiceInterface;
