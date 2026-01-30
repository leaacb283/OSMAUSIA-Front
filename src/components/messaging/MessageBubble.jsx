/**
 * MessageBubble - Individual chat message bubble
 */
import './MessageBubble.css';

const MessageBubble = ({ message, isMine, showTime = true }) => {

    // Format message time
    const formatTime = (dateStr) => {
        if (!dateStr) return '';

        let date;
        // Handle array format [year, month, day, hour, minute, second]
        if (Array.isArray(dateStr)) {
            const [year, month, day, hour = 0, minute = 0] = dateStr;
            date = new Date(year, month - 1, day, hour, minute);
        } else {
            date = new Date(dateStr);
        }

        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
            <div className="message-bubble__content">
                <p className="message-bubble__text">{message.content}</p>
                {showTime && (
                    <span className="message-bubble__time">
                        {formatTime(message.sentAt)}
                        {isMine && message.isRead && (
                            <span className="message-bubble__read" title="Lu">✓✓</span>
                        )}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
