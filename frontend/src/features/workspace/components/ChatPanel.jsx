/**
 * ChatPanel.jsx
 *
 * Right-side AI Chat panel in the Blueprint Workspace.
 * Allows users to converse with the AI to refine and update the active document.
 *
 * Refinement flow:
 *   1. User types instruction → sends to backend /refine endpoint
 *   2. Backend returns { message, updatedContent } — NO persistence
 *   3. ChatPanel calls onApplyRefinement(updatedContent) → DocumentViewer local draft
 *   4. User reviews the change in the document editor
 *   5. User explicitly saves via existing Save button
 *
 * Chat history is session-local only (resets on doc switch).
 */

import { useState, useEffect, useRef } from 'react';
import { fetchDocumentChat, refineDocument, normalizeDocumentContent, BLUEPRINT_DOCS } from '../services/workspaceService';

const ChatMessage = ({ msg }) => {
  const isUser = msg.role === 'user';
  const isError = msg.role === 'error';

  let bgStyle, borderStyle, textColor;
  if (isUser) {
    bgStyle = 'rgba(59,130,246,0.15)';
    borderStyle = '1px solid rgba(59,130,246,0.3)';
    textColor = '#E0F2FE';
  } else if (isError) {
    bgStyle = 'rgba(239,68,68,0.08)';
    borderStyle = '1px solid rgba(239,68,68,0.2)';
    textColor = '#FCA5A5';
  } else {
    bgStyle = 'rgba(255,255,255,0.04)';
    borderStyle = '1px solid rgba(255,255,255,0.08)';
    textColor = 'rgba(255,255,255,0.85)';
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 ws-enter-up`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed`}
        style={{
          background: bgStyle,
          border: borderStyle,
          color: textColor,
          borderBottomRightRadius: isUser ? '4px' : '16px',
          borderBottomLeftRadius: isUser ? '16px' : '4px',
        }}
      >
        {/* Render a tiny icon for AI or error */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5 opacity-60">
            {isError ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="7" stroke="#F87171" strokeWidth="1.2" />
                <path d="M8 5v4M8 11v.5" stroke="#F87171" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5" />
              </svg>
            )}
            <span className="text-[0.65rem] font-bold tracking-wider uppercase">
              {isError ? 'Error' : 'Blueprint AI'}
            </span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {/* Applied badge for successful refinements */}
        {msg.applied && (
          <div className="mt-2 flex items-center gap-1.5" style={{ color: '#34D399', fontSize: '0.65rem' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6l3 3 5-5" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Applied to draft — review and Save to persist
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPanel = ({
  projectId,
  activeDocId,
  onDocumentRefined,
  onApplyRefinement,  // (normalizedDoc) => void — applies to DocumentViewer local draft
  width = 320,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reset chat when active document changes (session-local — no persistence)
  useEffect(() => {
    if (!activeDocId || !projectId) return;

    let isMounted = true;
    setLoadingHistory(true);
    setMessages([]);

    fetchDocumentChat(projectId, activeDocId)
      .then(history => {
        if (isMounted) {
          setMessages(history);
          setLoadingHistory(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => { isMounted = false; };
  }, [activeDocId, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userInstruction = input.trim();
    setInput('');

    // Add optimistic user message
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: userInstruction }]);
    setIsTyping(true);

    try {
      // Call the real backend refinement API
      const { message, updatedContent } = await refineDocument(projectId, activeDocId, userInstruction);

      // Build AI response message
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: message,
        applied: !!updatedContent,
      };
      setMessages(prev => [...prev, aiMsg]);

      // Apply to local draft via normalizeDocumentContent (same path as loading)
      const applyFn = onDocumentRefined || onApplyRefinement;
      if (updatedContent && applyFn) {
        const normalizedDoc = normalizeDocumentContent(activeDocId, updatedContent, {
          title: updatedContent.title,
          status: 'ready',
          projectId,
        });
        if (normalizedDoc) {
          applyFn(normalizedDoc);
        }
      }
    } catch (err) {
      // Extract error message from normalized API error
      const errMsg = err?.message || 'I encountered an error while trying to update the document. Please try again.';
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'error',
        content: errMsg,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Doc label for display
  const docMeta = BLUEPRINT_DOCS.find(d => d.id === activeDocId);
  const docLabel = docMeta?.label || activeDocId;

  return (
    <aside
      className="hidden xl:flex flex-col ws-enter-right"
      style={{
        width: width,
        background: '#0D1117',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}
      aria-label="AI Chat panel"
    >
      {/* Header */}
      <div
        className="px-5 py-4 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Blueprint AI
          </h3>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Refining {docLabel}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', fontSize: '0.65rem' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Online
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin flex flex-col">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <span className="w-5 h-5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs max-w-[200px] leading-relaxed">
              How can I help you refine this {docLabel}?
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-end min-h-full">
            {messages.map(msg => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex w-full justify-start mb-4 ws-enter-up">
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderBottomLeftRadius: '4px',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className="shrink-0 p-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <form onSubmit={handleSubmit} className="relative flex items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Describe a change to ${docLabel}…`}
            className="w-full bg-[#161B22] rounded-xl pl-4 pr-12 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 scrollbar-hide"
            style={{
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              minHeight: '44px',
              maxHeight: '120px'
            }}
            rows={1}
            disabled={isTyping || loadingHistory}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || loadingHistory}
            className="absolute right-2 bottom-2 p-1.5 rounded-lg text-white transition-colors disabled:opacity-30"
            style={{
              background: input.trim() && !isTyping ? '#3B82F6' : 'transparent',
              color: input.trim() && !isTyping ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 7h11m0 0L8 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className="text-[0.6rem] text-center mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Changes are applied to your draft. Use Save to persist.
        </p>
      </div>
    </aside>
  );
};

export default ChatPanel;
