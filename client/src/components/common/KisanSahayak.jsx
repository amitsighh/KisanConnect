import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  Wheat,
  Languages
} from 'lucide-react';
import { askKisanAssistant } from '../../services/aiService';
import { cleanTextForDisplay } from '../../utils/speechUtils';

const SUPPORTED_LANGUAGES = [
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'haryanvi', label: 'Haryanvi', native: 'हरियाणवी' }
];

const QUICK_HELP_PROMPTS = [
  { icon: '🌱', label: 'Crop Listing', prompt: 'ACIRE par apni fasal kaise list karein?' },
  { icon: '💰', label: 'Mandi Price', prompt: 'Live Mandi reference price kya hai aur kaise check karein?' },
  { icon: '🤝', label: 'Mol-Bhav / Bids', prompt: 'Buyer ke sath bhao negotiate ya counter offer kaise karein?' },
  { icon: '🛒', label: 'Cart & Buy', prompt: 'Marketplace se direct produce kaise kharidein?' },
  { icon: '📦', label: 'My Orders', prompt: 'Order status aur delivery live tracking kaise check karein?' },
  { icon: '❓', label: 'Help / Next Step', prompt: 'Mujhe samajh nahi aa raha, is page par agla step kya hai?' }
];

export const KisanSahayak = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('hinglish');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Namaste! Main aapka Kisan Sahayak hoon. ACIRE platform use karne me main aapki madad kar sakta hoon. Aap mic dabakar bol sakte hain ya neeche type kar sakte hain!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech-to-Text Initialization (Voice Input Only)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('Aawaz sunayi nahi di. Kripya dobara boliye.');
        } else {
          setSpeechError(`Voice input issue: ${event.error}. You can type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Toggle Microphone
  const toggleListening = () => {
    if (!speechSupported) {
      setSpeechError('Voice input is not supported on this browser. You can type your question.');
      return;
    }

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsListening(false);
    } else {
      setSpeechError('');
      try {
        if (recognitionRef.current) {
          let recLang = 'hi-IN';
          if (language === 'en') recLang = 'en-IN';
          else if (language === 'pa') recLang = 'pa-IN';
          else if (language === 'ta') recLang = 'ta-IN';
          else if (language === 'mr') recLang = 'mr-IN';
          else if (language === 'bn') recLang = 'bn-IN';
          else if (language === 'te') recLang = 'te-IN';
          else if (language === 'gu') recLang = 'gu-IN';
          else if (language === 'kn') recLang = 'kn-IN';
          else if (language === 'ml') recLang = 'ml-IN';
          else if (language === 'or') recLang = 'or-IN';
          else if (language === 'as') recLang = 'as-IN';

          recognitionRef.current.lang = recLang;
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  // Language Change Handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
    if (langObj) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: `🌐 Language switched to ${langObj.label} (${langObj.native}). All new responses will be in ${langObj.native}.`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Submit Question to Assistant
  const handleSendMessage = async (textToSend = null) => {
    const question = (textToSend || inputText).trim();
    if (!question || loading) return;

    setInputText('');
    setSpeechError('');

    // Append user message
    const userMsg = { sender: 'user', text: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await askKisanAssistant({
        question,
        language,
        currentPath: location.pathname
      });

      if (res && res.answer) {
        // Auto-update language state if user explicitly requested a switch in their prompt
        if (res.language && res.language !== language) {
          setLanguage(res.language);
        }

        const assistantMsg = {
          sender: 'assistant',
          text: res.answer,
          pageContext: res.pageContext,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: 'Maaf kijiye, network issue ke karan connect nahi ho paya. Aap neeche diye quick options se madad le sakte hain.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Get readable label for current route
  const getPageBadge = () => {
    const p = location.pathname;
    if (p === '/') return 'Home / Overview';
    if (p.startsWith('/marketplace')) return 'Marketplace Catalog';
    if (p.startsWith('/produce')) return 'Produce Details';
    if (p.startsWith('/farmer')) return 'Farmer Dashboard';
    if (p.startsWith('/buyer')) return 'Buyer Desk';
    if (p.startsWith('/checkout')) return 'Checkout';
    if (p.startsWith('/login')) return 'Sign In';
    if (p.startsWith('/register')) return 'Register';
    if (p.startsWith('/admin')) return 'Ministry Admin';
    return 'ACIRE';
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-emerald-300/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group"
          title="Open Kisan Sahayak Chat Assistant"
        >
          <div className="relative">
            <Wheat size={22} className="text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black tracking-tight leading-none">Kisan Sahayak</span>
            <span className="text-[10px] text-emerald-200 font-semibold leading-tight">AI Chat Guide</span>
          </div>
        </button>
      )}

      {/* Assistant Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                <Wheat size={20} className="text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm">Kisan Sahayak</h3>
                  <span className="bg-emerald-400 text-slate-950 font-bold text-[9px] px-1.5 py-0.2 rounded uppercase">
                    AI Chat Guide
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                  <MapPin size={10} />
                  <span>Page: {getPageBadge()}</span>
                </div>
              </div>
            </div>

            {/* Language & Close */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-emerald-950/80 text-white border border-emerald-700/60 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none"
                  title="Select Language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[400px] bg-slate-50/50">
            {messages.map((msg, idx) => {
              if (msg.sender === 'system') {
                return (
                  <div key={idx} className="text-center my-1">
                    <span className="inline-block px-3 py-1 bg-emerald-100/80 text-emerald-900 rounded-full text-[10px] font-semibold border border-emerald-200">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-[88%] leading-relaxed space-y-1.5 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {/* Cleaned text without any raw Markdown asterisks */}
                    <div className="whitespace-pre-line font-normal text-slate-800">
                      {cleanTextForDisplay(msg.text)}
                    </div>

                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-semibold text-emerald-800">🌾 Kisan Sahayak</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 max-w-[75%] text-xs text-slate-500">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Kisan Sahayak soch raha hai...</span>
              </div>
            )}

            {speechError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl flex items-center gap-1.5">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Help Prompt Chips */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_HELP_PROMPTS.map((q) => (
              <button
                key={q.label}
                onClick={() => handleSendMessage(q.prompt)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-full text-[10px] font-bold text-slate-700 whitespace-nowrap transition flex items-center gap-1 shrink-0"
              >
                <span>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* Voice Input & Typing Bar */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            
            {isListening && (
              <div className="p-2 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs flex items-center justify-between animate-pulse">
                <span className="flex items-center gap-2 font-bold text-[11px]">
                  <Mic size={14} className="text-red-600 animate-bounce" />
                  <span>Aapki aawaz sun rahe hain... (Boliye)</span>
                </span>
                <button
                  onClick={toggleListening}
                  className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded"
                >
                  Rukiye ⏹
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-2"
            >
              {/* Microphone Button (Speech-to-Text) */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
                title={isListening ? 'Stop listening' : 'Speak your question'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Text input */}
              <input
                type="text"
                placeholder={isListening ? 'Sun rahe hain...' : 'Apna sawal likhein ya mic se bolkar poochein...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs transition disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Sparkles size={10} className="text-emerald-600" />
              <span>ACIRE AI • Multilingual Chat Guide</span>
            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default KisanSahayak;
