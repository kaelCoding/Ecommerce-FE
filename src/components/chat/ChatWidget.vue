<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { token, get_auth_user, get_auth_info } from '@/stores/auth';
import { getChatHistory } from '@/services/chatService';
import { getAdminInfo } from '@/services/userService';
import { getWebSocketUrl } from '@/models/api';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { updateFCMToken } from "@/services/fcmService";
import { useI18n } from 'vue-i18n';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { t } = useI18n();
const messages = ref([]);
const newMessage = ref('');
const socket = ref(null);
const admin = ref(null);
const messageListEl = ref(null);
const connectionError = ref(false);
const isLoading = ref(false)
const chatInputEl = ref(null);

const scrollToBottom = () => {
    nextTick(() => {
        if (messageListEl.value) {
            messageListEl.value.scrollTop = messageListEl.value.scrollHeight;
        }
    });
};

const setupFCM = async () => {
    try {
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, {
            vapidKey: "BMJYrDhHREPAVJuzDYrBQb6APXLLy4KEGMMds0SMf-PtNIAS9-lnPOmoXlbVi00w2hhAjgO8CxW8BnmRDhHMx3w"
        });

        if (currentToken) {
            await updateFCMToken(currentToken);
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
    }
}

const connectWebSocket = () => {
    if (!token.value) {
        connectionError.value = true;
        return;
    }

    const rawToken = token.value.startsWith('Bearer ') ? token.value.substring(7) : token.value;
    const wsUrl = `${getWebSocketUrl()}?token=${rawToken}`;

    socket.value = new WebSocket(wsUrl);

    socket.value.onopen = () => {
        connectionError.value = false;
    };

    socket.value.onerror = (error) => {
        connectionError.value = true;
    };
};

const sendMessage = () => {
    if (newMessage.value.trim() === '' || !socket.value || !admin.value || socket.value.readyState !== WebSocket.OPEN) {
        return;
    }

    const messagePayload = {
        content: newMessage.value,
        receiverId: admin.value.id,
    };

    socket.value.send(JSON.stringify(messagePayload));

    newMessage.value = '';
    scrollToBottom();
    if (chatInputEl.value) {
        chatInputEl.value.style.height = 'auto';
    }
};

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const autoResizeTextarea = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
}

onMounted(async () => {
    isLoading.value = true
    if (!get_auth_user.value) {
        await get_auth_info();
    }

    if (!token.value || !get_auth_user.value) return;

    try {
        const [history, adminInfo] = await Promise.all([getChatHistory(), getAdminInfo()]);
        messages.value = history || [];
        admin.value = adminInfo;
        isLoading.value = false;
        scrollToBottom();
        connectWebSocket();
        setupFCM();
    } catch (error) {
        console.error('Failed to load chat data:', error);
    }
});

onUnmounted(() => {
    if (socket.value) {
        socket.value.close();
    }
});
</script>

<template>
    <div class="chat-widget">
        <div class="chat-panel">
            <div class="chat-header">
                <h3>TUNI TOKU</h3>
                <button class="close-btn" @click="$emit('close')" aria-label="Đóng cửa sổ chat">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div v-if="connectionError" class="error-banner">
                {{ t('Chat.err') }}
            </div>
            <LoadingSpinner v-if="isLoading" message="Đang tải tin nhắn..." />
            <div class="message-list" ref="messageListEl">
                <div v-for="msg in messages" :key="msg.ID || msg.timestamp" class="message-item"
                    :class="get_auth_user && msg.senderId === get_auth_user.id ? 'sent' : 'received'">
                    <div class="message-content pre-line-text">{{ msg.content }}</div>
                    <div class="message-timestamp">{{ formatTimestamp(msg.timestamp) }}</div>
                </div>
            </div>
            <div class="chat-input-area">
                <textarea ref="chatInputEl" class="chat-input" :placeholder="t('Chat.placeholder')" v-model="newMessage"
                    @keydown.enter.prevent.exact="sendMessage" rows="1" @input="autoResizeTextarea">
                </textarea>
                <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-widget {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 370px;
    max-width: calc(100% - 48px);
    height: 70vh;
    max-height: 600px;
    background-color: var(--body-color);
    border: 1px solid var(--light-gray-color);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chat-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px;
}

@media (max-width: 768px) {
    .chat-widget {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
        bottom: 0px;
        animation: slide-in-from-bottom 0.3s ease-out;
    }

    .chat-panel {
        height: 100vh;
        transform: none;
    }

    .chat-header {
        border-radius: 0;
    }
}

@keyframes slide-in-from-bottom {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}
</style>