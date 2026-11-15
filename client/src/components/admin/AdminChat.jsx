import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Bot, User, Wrench } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

const AdminChat = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestions = [
    t.suggestSales || 'Sales of a product',
    t.suggestStock || 'Stock left',
    t.suggestAvgSales || 'Average weekly sales',
    t.suggestTopProducts || 'Top products',
    t.suggestLowStock || 'Low stock items',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/admin/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.answer,
        toolCalls: response.data.toolCalls || [],
      }]);
    } catch (err) {
      setError(t.chatError || 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">
              {t.chatTitle || 'Admin Assistant'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t.chatEmpty || 'Ask me anything about your store!'}</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-900'} rounded-2xl px-4 py-3`}>
                <div className="flex items-start gap-2">
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm">{msg.content}</p>
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.toolCalls.map((tool, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            <Wrench className="w-3 h-3" />
                            {t.toolBadgePrefix || 'Used'}: {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-500">{t.chatThinking || 'Thinking...'}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-3 bg-red-50 text-red-700 rounded-2xl px-4 py-3 text-sm">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-xs font-bold text-red-800 hover:text-red-900 underline"
              >
                {t.chatRetry || 'Retry'}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatPlaceholder || 'Ask about sales, stock, orders...'}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span className="text-sm font-bold">{t.chatSend || 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChat;
