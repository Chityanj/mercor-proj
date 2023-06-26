import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import axios from 'axios';

const VoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const silenceTimeoutRef = useRef(null);
  const [gptResponse, setGptResponse] = useState('');

  const synthesisRef = useRef(null);

  const { listen, stop } = useSpeechRecognition({
    onResult: result => {
      setTranscription(result);
      resetSilenceTimeout();
      startSilenceTimeout();
    },
  });

  useEffect(() => {
    if (!isListening && transcription) {
      sendTranscriptionToGPT(transcription);
    }
  }, [isListening, transcription]);

  useEffect(() => {
    if (isListening) {
      listen();
      startSilenceTimeout();
    } else {
      stop();
      resetSilenceTimeout();
    }
  }, [isListening]);

  useEffect(() => {
    if (gptResponse) {
      speakGptResponse();
    }

    return () => {
      cleanupSpeechSynthesis();
    };
  }, [gptResponse]);

  const startSilenceTimeout = () => {
    silenceTimeoutRef.current = setTimeout(() => {
      setIsListening(false);
      console.log('Recording stopped after detecting silence.');
    }, 2000);
  };

  const resetSilenceTimeout = () => {
    clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = null;
  };

  const sendTranscriptionToGPT = async (transcription) => {
    try {
      const response = await axios.get('/api/gpt', { params: { transcription } });
      const gptResponse = response.data;
      setGptResponse(gptResponse);
      console.log('GPT Response:', gptResponse);
      // Handle the GPT response as needed
    } catch (error) {
      console.error('Error sending transcription to GPT:', error);
    }
  };

  const speakGptResponse = () => {
    if ('speechSynthesis' in window) {
      cleanupSpeechSynthesis();

      synthesisRef.current = new SpeechSynthesisUtterance(gptResponse);
      synthesisRef.current.lang = 'en-US';
      synthesisRef.current.onend = () => {
        synthesisRef.current = null;
      };
      speechSynthesis.speak(synthesisRef.current);
    }
  };

  const cleanupSpeechSynthesis = () => {
    if (synthesisRef.current) {
      synthesisRef.current.onend = null;
      speechSynthesis.cancel();
      synthesisRef.current = null;
    }
  };

  const handleStartListening = () => {
    setIsListening(true);
    cleanupSpeechSynthesis();
    resetSilenceTimeout();
  };

  useEffect(() => {
    return () => {
      cleanupSpeechSynthesis();
      resetSilenceTimeout();
    };
  }, []);

  return (
    <div>
      <button onClick={handleStartListening} disabled={isListening}>
        Start Listening
      </button>
      <p>Transcription: {transcription}</p>
      {gptResponse && (
        <div>
          <h3>GPT Response:</h3>
          <p>{gptResponse}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
