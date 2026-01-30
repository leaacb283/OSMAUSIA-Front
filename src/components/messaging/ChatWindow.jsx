/**
 * ChatWindow - Main chat area with messages and input
 */
import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

const ChatWindow = ({
    messages,
    partner,
    currentUserType,
    onSendMessage,
    loading,
    sending
}) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Handle send message
    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        onSendMessage(newMessage.trim());
        setNewMessage('');
        inputRef.current?.focus();
    };

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    // Check if message is from current user
    const isMyMessage = (message) => {
        return message.senderType === currentUserType;
    };

    // No partner selected
    if (!partner) {
        return (
            <div className="chat-window chat-window--empty">
                <div className="chat-window__placeholder">
                    {/* Emoji removed for cleaner look */}
                    <h3>Sélectionnez une conversation</h3>
                    <p>Choisissez un contact pour commencer à discuter</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-window__header">
                <div className="chat-window__partner">
                    <div className="chat-window__avatar">
                        {partner.partnerName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="chat-window__info">
                        <h3>{partner.partnerName || 'Utilisateur'}</h3>
                        <span>{partner.type === 'PROVIDER' ? 'Hébergeur' : 'Voyageur'}</span>
                    </div>
                </div>
            </div>

            {/* Messages area */}
            <div className="chat-window__messages" ref={messagesContainerRef}>
                {loading ? (
                    <div className="chat-window__loading">
                        <div className="chat-window__spinner"></div>
                        <p>Chargement des messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-window__no-messages">
                        <p>Aucun message pour le moment</p>
                        <span>Envoyez un message pour démarrer la conversation !</span>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message.id || index}
                                message={message}
                                isMine={isMyMessage(message)}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Input area */}
            <form className="chat-window__input-area" onSubmit={handleSend}>
                <textarea
                    ref={inputRef}
                    className="chat-window__input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez votre message..."
                    rows={1}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="chat-window__send-btn"
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? (
                        <span className="chat-window__send-spinner"></span>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
