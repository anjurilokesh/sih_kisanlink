'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const speechLocales = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
  or: 'or-IN',
  ml: 'ml-IN',
};

const detectSpeechLocale = (text, fallback) => {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN';
  return speechLocales[fallback] || 'en-IN';
};

const languageFromSpeechLocale = (locale) => Object.entries(speechLocales).find(([, value]) => value === locale)?.[0] || 'en';

export default function ChatbotPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'नमस्कार! मैं किसान AI हूँ। मैं तुम्हारी बाजार और खरीदार सहायता में मदद कर सकता हूँ।' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [websiteData, setWebsiteData] = useState({ markets: [], buyers: [] });
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [voiceGender, setVoiceGender] = useState('');
  const [replyLanguage, setReplyLanguage] = useState(language);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setVoiceGender(localStorage.getItem('kisanlink-voice-gender') || '');
  }, []);

  useEffect(() => setReplyLanguage(language), [language]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/markets`).then((res) => res.json()),
      fetch(`${API_URL}/buyers`).then((res) => res.json()),
    ])
      .then(([markets, buyers]) => {
        setWebsiteData({
          markets: (markets.data || []).slice(0, 10),
          buyers: (buyers.data || []).slice(0, 10),
        });
      })
      .catch(() => setWebsiteData({ markets: [], buyers: [] }));

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakReply = (text, responseLanguage = replyLanguage) => {
    if (!window.speechSynthesis || !voiceGender) {
      setVoiceStatus('Choose a male or female voice before listening to replies.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLocales[responseLanguage] || detectSpeechLocale(text, responseLanguage);
    const voices = window.speechSynthesis.getVoices();
    const languageVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2)));
    const genderTerms = voiceGender === 'female'
      ? ['female', 'woman', 'zira', 'susan', 'samantha', 'karen', 'veena', 'heera']
      : ['male', 'man', 'david', 'mark', 'ravi', 'hemant'];
    const genderVoice = languageVoices.find((voice) => genderTerms.some((term) => voice.name.toLowerCase().includes(term)));
    const matchingVoice = genderVoice || languageVoices[voiceGender === 'female' ? 0 : 1] || languageVoices[0];
    if (matchingVoice) utterance.voice = matchingVoice;
    window.speechSynthesis.speak(utterance);
  };

  const chooseVoice = (event) => {
    const selectedVoice = event.target.value;
    setVoiceGender(selectedVoice);
    localStorage.setItem('kisanlink-voice-gender', selectedVoice);
    setVoiceStatus(selectedVoice ? `AI voice set to ${selectedVoice}.` : 'Choose a male or female AI voice.');
  };

  const toggleRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLocales[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsRecognizing(true);
      setTranscript('');
      setVoiceStatus('Started recognizing voice...');
    };
    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalText += text;
        else interimText += text;
      }

      const visibleTranscript = `${finalText} ${interimText}`.trim();
      setTranscript(visibleTranscript);
      if (finalText.trim()) {
        setInput(finalText.trim());
        setReplyLanguage(languageFromSpeechLocale(detectSpeechLocale(finalText.trim(), language)));
      }
    };
    recognition.onerror = (event) => {
      const messages = {
        network: 'Voice recognition needs an internet connection in this browser. Check your connection or type your message instead.',
        'not-allowed': 'Microphone access was blocked. Allow microphone access for this site, then try again.',
        'service-not-allowed': 'This browser does not allow its speech service. Try Chrome or use the text box instead.',
        'audio-capture': 'No microphone was detected. Check your microphone or use the text box instead.',
      };
      setVoiceStatus(messages[event.error] || `Voice recognition error: ${event.error}. You can type your message instead.`);
      setIsRecognizing(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsRecognizing(false);
      recognitionRef.current = null;
      setVoiceStatus((current) => current || 'Voice recognition finished.');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const sendMessage = async () => {
    const message = input.trim();
    if (!message) return;
    const nextMessage = { sender: 'user', text: message };
    setMessages((prev) => [...prev, nextMessage]);
    setInput('');
    setTranscript('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language: replyLanguage || language, user, websiteData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'The AI service is unavailable.');
      const reply = data.data?.reply || 'No reply';
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      speakReply(reply, replyLanguage || language);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: error.message || 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="card flex h-[70vh] flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h1 className="text-3xl font-black text-slate-900">Kisan AI</h1>
          <p className="mt-1 text-sm text-slate-500">Gemini • {language.toUpperCase()} • Your profile, markets, and buyers are available to the assistant</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((msg, index) => (
            <div key={`${msg.sender}-${index}`} className={`max-w-md rounded-2xl px-4 py-3 text-sm ${msg.sender === 'user' ? 'ml-auto bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="max-w-md rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Thinking…</div>}
        </div>

        <div className="border-t border-slate-200 p-4">
          {(isRecognizing || transcript || voiceStatus) && (
            <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800" aria-live="polite">
              <p className="font-semibold">{voiceStatus || 'Voice transcript'}</p>
              {transcript && <p className="mt-1 text-emerald-700">{transcript}</p>}
            </div>
          )}
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="voice-gender">Choose AI voice</label>
            <select id="voice-gender" value={voiceGender} onChange={chooseVoice} className="max-w-[130px]">
              <option value="">Choose voice</option>
              <option value="female">Female voice</option>
              <option value="male">Male voice</option>
            </select>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about market prices or buyers..." className="flex-1" />
            <button className={`btn-secondary ${isRecognizing ? 'bg-red-100 text-red-700' : ''}`} onClick={toggleRecognition} aria-label={isRecognizing ? 'Stop voice recognition' : 'Start voice recognition'}>
              {isRecognizing ? 'Stop' : '🎙️'}
            </button>
            <button className="btn-primary" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </main>
  );
}
