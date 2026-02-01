/**
 * Messaging Service - OSMAUSIA
 * Hybrid approach: HTTP for sending, WebSocket (STOMP) for real-time reception
 */

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import api from './api';

const WS_URL = '/ws-chat';

let stompClient = null;
let messageCallback = null;
let connectionCallback = null;

/**
 * Connect to WebSocket for real-time messages
 * @param {Function} onMessage - Callback when a message is received
 * @param {Function} onConnect - Callback when connection is established
 * @param {Function} onError - Callback when an error occurs
 */
export const connectWebSocket = (onMessage, onConnect, onError) => {
    // Disconnect existing connection if any
    if (stompClient && stompClient.connected) {
        stompClient.deactivate();
    }

    messageCallback = onMessage;
    connectionCallback = onConnect;

    // Get JWT token from local storage
    const storedUser = localStorage.getItem('osmausia-user');
    let token = null;
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            token = user.token;
        } catch (e) {
            console.error('Error parsing user token', e);
        }
    }

    const connectHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Create STOMP client over SockJS
    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: connectHeaders,
        debug: (str) => {
            console.log('[STOMP]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
        console.log('[STOMP] Connected:', frame);

        // Subscribe to personal message queue
        stompClient.subscribe('/user/queue/messages', (message) => {
            const parsedMessage = JSON.parse(message.body);
            console.log('[STOMP] Message received:', parsedMessage);
            if (messageCallback) {
                messageCallback(parsedMessage);
            }
        });

        if (connectionCallback) {
            connectionCallback();
        }
    };

    stompClient.onStompError = (frame) => {
        console.error('[STOMP] Error:', frame.headers['message']);
        console.error('[STOMP] Details:', frame.body);
        if (onError) {
            onError(frame);
        }
    };

    stompClient.onWebSocketClose = () => {
        console.log('[STOMP] WebSocket connection closed');
    };

    stompClient.activate();
};

/**
 * Disconnect from WebSocket
 */
export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
    messageCallback = null;
    connectionCallback = null;
};

/**
 * Check if WebSocket is connected
 */
export const isConnected = () => {
    return stompClient && stompClient.connected;
};

// ============================================================
// HTTP API Methods
// ============================================================

/**
 * Send a message via HTTP
 * @param {Object} messageData - Message payload
 * @param {number} messageData.travelerId - Traveler ID
 * @param {number} messageData.providerId - Provider ID
 * @param {string} messageData.senderType - "TRAVELER" or "PROVIDER"
 * @param {string} messageData.content - Message content
 */
export const sendMessage = async (messageData) => {
    const response = await api.post('/messaging/messages', messageData);
    return response.data;
};

/**
 * Get list of conversations for the current user
 * @returns {Promise<Array>} List of conversation partners
 */
export const getConversations = async () => {
    const response = await api.get('/messaging/conversations');
    return response.data;
};

/**
 * Get message history for a specific conversation
 * @param {number} travelerId - Traveler ID
 * @param {number} providerId - Provider ID
 * @returns {Promise<Array>} List of messages (chronological)
 */
export const getMessageHistory = async (travelerId, providerId) => {
    const response = await api.get(`/messaging/history?travelerId=${travelerId}&providerId=${providerId}`);
    return response.data;
};

/**
 * Mark messages from a partner as read
 * @param {number} partnerId - Partner ID (Provider if I'm traveler, Traveler if I'm provider)
 */
export const markAsRead = async (partnerId) => {
    const response = await api.patch(`/messaging/conversations/read?partnerId=${partnerId}`);
    return response.data;
};

/**
 * Get total unread message count
 * @returns {Promise<number>} Total unread messages across all conversations
 */
export const getUnreadCount = async () => {
    try {
        const conversations = await getConversations();
        // Sum up unreadCount from all conversations
        return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
    } catch (err) {
        console.error('Error fetching unread count:', err);
        return 0;
    }
};

/**
 * Message sender type constants
 */
export const SENDER_TYPE = {
    TRAVELER: 'TRAVELER',
    PROVIDER: 'PROVIDER',
};

export default {
    connectWebSocket,
    disconnectWebSocket,
    isConnected,
    sendMessage,
    getConversations,
    getMessageHistory,
    markAsRead,
    getUnreadCount,
    SENDER_TYPE,
};
