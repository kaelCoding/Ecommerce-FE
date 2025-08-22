<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { token, get_auth_user, get_auth_info } from '../stores/auth';
import { getChatHistory } from '../services/chatService';
import { getAdminInfo } from '../services/userService';
import { getWebSocketUrl } from '../models/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { getMessaging, getToken } from "firebase/messaging";
import { updateFCMToken } from "@/services/fcmService";

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

    socket.value.onmessage = (event) => {
        const message = JSON.parse(event.data);
        messages.value.push(message);
        scrollToBottom();
    };

    socket.value.onclose = () => console.log('WebSocket disconnected');
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
    <div class="client-chat-view">
        <div class="chat-container">
            <div class="chat-panel">
                <div class="chat-header">TUNI shop</div>
                <div v-if="connectionError" class="error-banner">
                    Không thể kết nối tới máy chủ chat. Vui lòng thử lại sau.
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
                    <textarea 
                        ref="chatInputEl"
                        class="chat-input" 
                        placeholder="Nhập tin nhắn..." 
                        v-model="newMessage"
                        @keydown.enter.prevent.exact="sendMessage" 
                        rows="1" @input="autoResizeTextarea"
                        >
                    </textarea>
                    <button class="btn-primary" @click="sendMessage" :disabled="!newMessage.trim()">Gửi</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
  height: calc(100vh - 72px);
}
</style>
