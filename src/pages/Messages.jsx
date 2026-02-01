/**
 * Messages Page - Real-time messaging between travelers and providers
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import {
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    getConversations,
    getMessageHistory,
    markAsRead,
    SENDER_TYPE,
} from '../services/messagingService';
import './Messages.css';

const Messages = () => {
    const { partnerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    // State
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [error, setError] = useState(null);

    // Determine current user type
    const currentUserType = user?.role === 'partner'
        ? SENDER_TYPE.PROVIDER
        : SENDER_TYPE.TRAVELER;

    const currentUserId = user?.id;

    // Refs for stable WebSocket callback
    const selectedPartnerRef = useRef(selectedPartner);
    const currentUserTypeRef = useRef(currentUserType);
    const messagesRef = useRef(messages);

    // Keep refs updated
    useEffect(() => {
        selectedPartnerRef.current = selectedPartner;
        currentUserTypeRef.current = currentUserType;
        messagesRef.current = messages;
    }, [selectedPartner, currentUserType, messages]);

    // Handle incoming WebSocket message (stable callback using refs)
    const handleIncomingMessage = useCallback((message) => {
        console.log('[Messages] Incoming message:', message);

        const currentPartner = selectedPartnerRef.current;
        const userType = currentUserTypeRef.current;

        // Handle Read Receipt
        if (message.type === 'READ_RECEIPT') {
            const readerId = message.partnerId; // The one who read

            // Update messages in current view - mark OUR sent messages as read
            if (currentPartner && currentPartner.partnerId === readerId) {
                setMessages(prev => prev.map(m =>
                    m.senderType === userType ? { ...m, isRead: true } : m
                ));
            }
            return;
        }

        // Handle Text Message
        // Update messages if this conversation is active
        const messagePartnerId = userType === SENDER_TYPE.TRAVELER
            ? message.providerId
            : message.travelerId;

        if (currentPartner && messagePartnerId === currentPartner.partnerId) {
            setMessages(prev => [...prev, message]);
            // Auto-mark as read since user is viewing this conversation
            // This triggers read receipt to sender
            markAsRead(currentPartner.partnerId).catch(err =>
                console.error('[Messages] Failed to mark as read:', err)
            );
        }

        // Update conversation list (add unread badge, move to top)
        setConversations(prev => {
            const updatedConversations = prev.map(conv => {
                if (conv.partnerId === messagePartnerId) {
                    return {
                        ...conv,
                        lastMessage: message.content,
                        lastMessageAt: message.sentAt,
                        unreadCount: (currentPartner && currentPartner.partnerId === messagePartnerId)
                            ? 0
                            : (conv.unreadCount || 0) + 1,
                    };
                }
                return conv;
            });

            // Sort by last message time
            return updatedConversations.sort((a, b) => {
                const timeA = new Date(a.lastMessageAt || 0);
                const timeB = new Date(b.lastMessageAt || 0);
                return timeB - timeA;
            });
        });
    }, []); // Empty deps - uses refs for current values

    // Connect to WebSocket on mount
    useEffect(() => {
        if (!isAuthenticated) return;

        connectWebSocket(
            handleIncomingMessage,
            () => {
                console.log('[Messages] WebSocket connected');
                setWsConnected(true);
            },
            (error) => {
                console.error('[Messages] WebSocket error:', error);
                setWsConnected(false);
            }
        );

        return () => {
            disconnectWebSocket();
        };
    }, [isAuthenticated, handleIncomingMessage]);

    // Fetch conversations on mount
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchConversations = async () => {
            setLoadingConversations(true);
            try {
                const data = await getConversations();
                setConversations(data || []);

                // If partnerId in URL, select that conversation
                if (partnerId) {
                    const partner = data?.find(c => c.partnerId === parseInt(partnerId));
                    if (partner) {
                        setSelectedPartner(partner);
                    } else if (location.state?.partnerName) {
                        // New conversation from navigation state
                        const newConversation = {
                            partnerId: parseInt(partnerId),
                            partnerName: location.state.partnerName,
                            unreadCount: 0,
                            lastMessage: '',
                            lastMessageAt: new Date().toISOString()
                        };
                        setConversations(prev => [newConversation, ...prev]);
                        setSelectedPartner(newConversation);
                    }
                }
            } catch (err) {
                console.error('[Messages] Failed to fetch conversations:', err);
                setError('Impossible de charger les conversations');
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [isAuthenticated, partnerId]);

    // Fetch messages when partner is selected
    useEffect(() => {
        if (!selectedPartner || !currentUserId) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            setMessages([]);

            try {
                const travelerId = currentUserType === SENDER_TYPE.TRAVELER
                    ? currentUserId
                    : selectedPartner.partnerId;
                const providerId = currentUserType === SENDER_TYPE.PROVIDER
                    ? currentUserId
                    : selectedPartner.partnerId;

                const data = await getMessageHistory(travelerId, providerId);
                setMessages(data || []);

                // Mark as read
                await markAsRead(selectedPartner.partnerId);

                // Update unread count in conversations
                setConversations(prev => prev.map(conv =>
                    conv.partnerId === selectedPartner.partnerId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                ));
            } catch (err) {
                console.error('[Messages] Failed to fetch messages:', err);
                // Non-blocking - just show empty
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedPartner, currentUserId, currentUserType]);

    // Handle conversation selection
    const handleSelectConversation = (conversation) => {
        setSelectedPartner(conversation);
        navigate(`/messages/${conversation.partnerId}`, { replace: true });
    };

    // Handle send message
    const handleSendMessage = async (content) => {
        if (!selectedPartner || !currentUserId) return;

        setSending(true);
        try {
            const travelerId = currentUserType === SENDER_TYPE.TRAVELER
                ? currentUserId
                : selectedPartner.partnerId;
            const providerId = currentUserType === SENDER_TYPE.PROVIDER
                ? currentUserId
                : selectedPartner.partnerId;

            await sendMessage({
                travelerId,
                providerId,
                senderType: currentUserType,
                content,
            });

            // Optimistically add message to UI
            const newMessage = {
                id: Date.now(), // Temporary ID
                travelerId,
                providerId,
                senderType: currentUserType,
                content,
                sentAt: new Date().toISOString(),
                isRead: false,
            };
            setMessages(prev => [...prev, newMessage]);

            // Update conversation preview
            setConversations(prev => prev.map(conv =>
                conv.partnerId === selectedPartner.partnerId
                    ? { ...conv, lastMessage: content, lastMessageAt: new Date().toISOString() }
                    : conv
            ));
        } catch (err) {
            console.error('[Messages] Failed to send message:', err);
            // Show error feedback
            setError('Échec de l\'envoi du message. Veuillez réessayer.');
        } finally {
            setSending(false);
        }
    };

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="messages-page messages-page--auth-required">
                <div className="messages-page__auth-message">
                    <h2>Connexion requise</h2>
                    <p>Veuillez vous connecter pour accéder à vos messages.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary">
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-page">
            {/* Connection status */}
            {!wsConnected && (
                <div className="messages-page__status messages-page__status--disconnected">
                    Reconnexion en cours...
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="messages-page__error">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="messages-page__container">
                {/* Conversation list */}
                <aside className="messages-page__sidebar">
                    <ConversationList
                        conversations={conversations}
                        selectedPartnerId={selectedPartner?.partnerId}
                        onSelectConversation={handleSelectConversation}
                        currentUserType={currentUserType}
                        loading={loadingConversations}
                    />
                </aside>

                {/* Chat window */}
                <main className="messages-page__chat">
                    <ChatWindow
                        messages={messages}
                        partner={selectedPartner}
                        currentUserType={currentUserType}
                        onSendMessage={handleSendMessage}
                        loading={loadingMessages}
                        sending={sending}
                    />
                </main>
            </div>
        </div>
    );
};

export default Messages;
