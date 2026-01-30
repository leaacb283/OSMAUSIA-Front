/**
 * ConversationList - List of chat conversations
 */
import './ConversationList.css';

const ConversationList = ({
    conversations,
    selectedPartnerId,
    onSelectConversation,
    currentUserType,
    loading
}) => {

    // Format last message timestamp
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        // Less than 24h: show time
        if (diff < 86400000) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        // Less than 7 days: show day
        if (diff < 604800000) {
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        }
        // Older: show date
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="conversation-list conversation-list--loading">
                <div className="conversation-list__spinner"></div>
                <p>Chargement des conversations...</p>
            </div>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="conversation-list conversation-list--empty">
                <div className="conversation-list__empty-icon">💬</div>
                <p>Aucune conversation</p>
                <span>Contactez un hébergeur pour commencer</span>
            </div>
        );
    }

    return (
        <div className="conversation-list">
            <div className="conversation-list__header">
                <h2>Messages</h2>
            </div>
            <div className="conversation-list__items">
                {conversations.map((conv) => {
                    const isSelected = selectedPartnerId === conv.partnerId;
                    const hasUnread = conv.unreadCount > 0;

                    return (
                        <div
                            key={conv.partnerId}
                            className={`conversation-item ${isSelected ? 'selected' : ''} ${hasUnread ? 'unread' : ''}`}
                            onClick={() => onSelectConversation(conv)}
                        >
                            <div className="conversation-item__avatar">
                                {conv.partnerName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="conversation-item__info">
                                <div className="conversation-item__header">
                                    <span className="conversation-item__name">
                                        {conv.partnerName || 'Utilisateur'}
                                    </span>
                                    <span className="conversation-item__time">
                                        {formatTime(conv.lastMessageAt)}
                                    </span>
                                </div>
                                <div className="conversation-item__preview">
                                    <span className="conversation-item__message">
                                        {conv.lastMessage || 'Aucun message'}
                                    </span>
                                    {hasUnread && (
                                        <span className="conversation-item__badge">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;
