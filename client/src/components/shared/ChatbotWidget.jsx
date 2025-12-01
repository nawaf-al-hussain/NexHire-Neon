import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

/**
 * ChatbotWidget Component
 * A floating chat widget with AI-powered responses
 */
const ChatbotWidget = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([]);
 const [inputValue, setInputValue] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [sessionId, setSessionId] = useState(null);
 const [faqs, setFaqs] = useState([]);
 const messagesEndRef = useRef(null);
 const inputRef = useRef(null);

 // Scroll to bottom when messages change
 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages]);

 // Fetch FAQs on mount
 useEffect(() => {
 const fetchFaqs = async () => {
 try {
 const res = await axios.get(`${API_BASE}/chatbot/faq`);
 setFaqs(res.data);
 } catch (err) {
 console.error('Failed to fetch FAQs:', err);
 }
 };
 fetchFaqs();
 }, []);

 // Add initial greeting when opening
 useEffect(() => {
 if (isOpen && messages.length === 0) {
 setMessages([
 {
 id: 1,
 type: 'bot',
 content: "Ask about jobs, applications, or interviews.",
 timestamp: new Date()
 }
 ]);
 }
 }, [isOpen]);

 // Focus input when opening
 useEffect(() => {
 if (isOpen) {
 setTimeout(() => inputRef.current?.focus(), 100);
 }
 }, [isOpen]);

 const sendMessage = async (messageText = inputValue) => {
 if (!messageText.trim() || isLoading) return;

 const userMessage = {
 id: Date.now(),
 type: 'user',
 content: messageText.trim(),
 timestamp: new Date()
 };

 setMessages(prev => [...prev, userMessage]);
 setInputValue('');
 setIsLoading(true);

 try {
 const res = await axios.post(`${API_BASE}/chatbot/message`, {
 message: messageText.trim(),
 sessionId
 });

 const botMessage = {
 id: Date.now() + 1,
 type: 'bot',
 content: res.data.response,
 intent: res.data.intent,
 confidence: res.data.confidence,
 interactionId: res.data.interactionId,
 timestamp: new Date()
 };

 if (!sessionId) {
 setSessionId(res.data.sessionId);
 }

 setMessages(prev => [...prev, botMessage]);
 } catch (err) {
 console.error('Chatbot error:', err);
 const errorMessage = {
 id: Date.now() + 1,
 type: 'bot',
 content: "Connection failed. Please try again.",
 isError: true,
 timestamp: new Date()
 };
 setMessages(prev => [...prev, errorMessage]);
 } finally {
 setIsLoading(false);
 }
 };

 const handleKeyPress = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
 };

 const handleFaqClick = (question) => {
 sendMessage(question);
 };

 const handleFeedback = async (messageId, wasHelpful) => {
 const message = messages.find(m => m.id === messageId);
 if (!message?.interactionId) return;

 try {
 await axios.post(`${API_BASE}/chatbot/feedback`, {
 interactionId: message.interactionId,
 wasHelpful
 });

 // Update message to show feedback was given
 setMessages(prev => prev.map(m =>
 m.id === messageId ? { ...m, feedbackGiven: wasHelpful } : m
 ));
 } catch (err) {
 console.error('Feedback error:', err);
 }
 };

 const formatTime = (date) => {
 return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 // Esc-to-close handler
 React.useEffect(() => {
 if (!isOpen) return;
 const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
 window.addEventListener('keydown', handleEsc);
 return () => window.removeEventListener('keydown', handleEsc);
 }, [isOpen]);

 return (
 <>
 {/* Floating Chat Button — soft reveal, no infinite bounce */}
 <button
 onClick={() => setIsOpen(true)}
 className={`fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center focus-ring z-[100] ${isOpen ? 'hidden' : ''}`}
 style={{
 backgroundColor: 'var(--accent)',
 color: '#ffffff',
 borderRadius: '999px',
 boxShadow: 'var(--shadow-lg)',
 transition: 'background-color var(--dur-base) var(--ease-out-soft), transform var(--dur-fast) var(--ease-out-soft)',
 animation: 'fadeIn 600ms var(--ease-spring) backwards',
 }}
 aria-label="Open chat assistant"
 >
 <MessageCircle size={20} strokeWidth={1.75} className="lg:w-6 lg:h-6" />
 </button>

 {/* Chat Modal — full-screen on mobile, anchored bottom-right on desktop */}
 {isOpen && (
 <div
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-end p-0 sm:p-4 lg:p-8"
 onClick={() => setIsOpen(false)}
 >
 <div
 role="dialog"
 aria-modal="true"
 aria-label="NexHire chat assistant"
 onClick={(e) => e.stopPropagation()}
 className="w-full h-[100dvh] sm:h-[500px] sm:max-w-[400px] lg:h-[550px] flex flex-col overflow-hidden sm:rounded-[var(--radius-xl)]"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 border: '1px solid var(--border-primary)',
 /* borderRadius set via className (sm:rounded-...) so
 mobile gets full-screen with no rounding */
 boxShadow: 'var(--shadow-lg)',
 animation: 'slideInFromBottom 300ms var(--ease-spring) backwards',
 }}
 >
 {/* Chat Header — solid bg, no gradient */}
 <div
 className="p-4 lg:p-5 flex items-center justify-between flex-shrink-0"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 borderBottom: '1px solid var(--border-primary)',
 }}
 >
 <div className="flex items-center gap-3">
 <div
 className="w-9 h-9 flex items-center justify-center"
 style={{
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <MessageCircle size={16} strokeWidth={1.75} />
 </div>
 <div>
 <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>NexHire Assistant</div>
 <div className="eyebrow" style={{ fontSize: 10 }}>Assistant</div>
 </div>
 </div>
 <button
 onClick={() => setIsOpen(false)}
 className="focus-ring"
 style={{
 padding: 6,
 color: 'var(--text-muted)',
 borderRadius: 'var(--radius-md)',
 transition: 'color var(--dur-base) var(--ease-out-soft)',
 }}
 aria-label="Close chat"
 >
 <X size={16} strokeWidth={1.75} />
 </button>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
 {messages.map((msg) => (
 <div
 key={msg.id}
 className={`flex gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
 >
 {msg.type === 'bot' && (
 <div
 className="w-7 h-7 flex-shrink-0 flex items-center justify-center"
 style={{
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <MessageCircle size={12} strokeWidth={1.75} />
 </div>
 )}
 <div
 className={`max-w-[80%] p-3 text-xs font-medium whitespace-pre-wrap`}
 style={
 msg.type === 'user'
 ? {
 backgroundColor: 'var(--accent)',
 color: '#ffffff',
 borderRadius: 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)',
 }
 : {
 backgroundColor: 'var(--bg-tertiary)',
 color: 'var(--text-primary)',
 borderRadius: 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
 }
 }
 >
 {msg.content}
 <div className={`text-[11px] mt-1 ${msg.type === 'user' ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
 {formatTime(msg.timestamp)}
 </div>

 {/* Feedback buttons for bot messages */}
 {msg.type === 'bot' && !msg.isError && msg.interactionId && (
 <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--border-primary)]">
 {msg.feedbackGiven ? (
 <span className="text-[11px] text-[var(--text-muted)]">
 Thanks for feedback!
 </span>
 ) : (
 <>
 <button
 onClick={() => handleFeedback(msg.id, true)}
 className="flex items-center gap-1 text-[11px] text-[var(--success)] hover:text-[var(--success)]"
 >
 <ThumbsUp size={12} /> Helpful
 </button>
 <button
 onClick={() => handleFeedback(msg.id, false)}
 className="flex items-center gap-1 text-[11px] text-[var(--danger)] hover:text-[var(--danger)]"
 >
 <ThumbsDown size={12} /> Not helpful
 </button>
 </>
 )}
 </div>
 )}
 </div>
 </div>
 ))}

 {isLoading && (
 <div className="flex gap-2.5">
 <div
 className="w-7 h-7 flex-shrink-0 flex items-center justify-center"
 style={{
 backgroundColor: 'var(--accent-soft)',
 color: 'var(--accent)',
 borderRadius: 'var(--radius-md)',
 }}
 >
 <MessageCircle size={12} strokeWidth={1.75} />
 </div>
 <div
 className="p-3 flex items-center gap-1"
 style={{
 backgroundColor: 'var(--bg-tertiary)',
 borderRadius: 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
 }}
 >
 {/* Three-dot typing indicator */}
 {[0, 1, 2].map(i => (
 <span
 key={i}
 style={{
 width: 5,
 height: 5,
 borderRadius: '999px',
 backgroundColor: 'var(--text-muted)',
 animation: `fadeIn 800ms ${i * 150}ms infinite alternate`,
 }}
 />
 ))}
 </div>
 </div>
 )}

 <div ref={messagesEndRef} />
 </div>

 {/* Quick Replies */}
 {messages.length <= 2 && faqs.length > 0 && (
 <div className="px-4 pb-2">
 <div className="eyebrow mb-2" style={{ fontSize: 10 }}>Quick Questions</div>
 <div className="flex flex-wrap gap-1.5">
 {faqs.slice(0, 8).map((faq) => (
 <button
 key={faq.id}
 onClick={() => handleFaqClick(faq.question)}
 className="focus-ring"
 style={{
 fontSize: 11,
 padding: '5px 10px',
 backgroundColor: 'var(--bg-tertiary)',
 color: 'var(--text-secondary)',
 borderRadius: 'var(--radius-sm)',
 transition: 'background-color var(--dur-base) var(--ease-out-soft), color var(--dur-base) var(--ease-out-soft)',
 }}
 >
 {faq.question}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Chat Input */}
 <div
 className="p-3 flex-shrink-0"
 style={{
 backgroundColor: 'var(--bg-elevated)',
 borderTop: '1px solid var(--border-primary)',
 }}
 >
 <div className="flex gap-2">
 <input
 ref={inputRef}
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 onKeyPress={handleKeyPress}
 placeholder="Type your question…"
 disabled={isLoading}
 className="input-soft flex-1 px-3 py-2.5 text-xs focus-ring"
 style={{ fontWeight: 400 }}
 aria-label="Type your question"
 />
 <button
 onClick={() => sendMessage()}
 disabled={!inputValue.trim() || isLoading}
 className="btn-primary"
 style={{
 width: 40,
 height: 40,
 padding: 0,
 borderRadius: 'var(--radius-md)',
 }}
 aria-label="Send message"
 >
 <Send size={14} strokeWidth={2} />
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 );
};

export default ChatbotWidget;
