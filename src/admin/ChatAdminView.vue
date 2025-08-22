<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { token, get_auth_user, get_auth_info } from '@/stores/auth';
import { getChatHistory } from '@/services/chatService';
import { get_users_api } from '@/services/auth';
import { getWebSocketUrl } from '@/models/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { updateFCMToken } from "@/services/fcmService";

const users = ref([]);
const selectedUser = ref(null);
const messages = ref([]);
const newMessage = ref('');
const socket = ref(null);
const messageListEl = ref(null);
const isLoadingHistory = ref(false);
const isLoading = ref(false);
const chatInputEl = ref(null);

const isChatVisible = ref(false);

const scrollToBottom = () => {
    nextTick(() => {
        if (messageListEl.value) {
            messageListEl.value.scrollTop = messageListEl.value.scrollHeight;
        }
    });
};

const selectUser = async (user) => {
    if (selectedUser.value?.id === user.id && isChatVisible.value) return;

    selectedUser.value = user;
    isChatVisible.value = true;
    
    messages.value = [];
    isLoadingHistory.value = true;
    try {
        const history = await getChatHistory(user.id);
        messages.value = history || [];
        const userInList = users.value.find(u => u.id === user.id);
        if (userInList) {
            userInList.hasNewMessage = false;
        }
        scrollToBottom();
    } catch (error) {
        console.error(`Failed to load chat history for user ${user.id}:`, error);
    } finally {
        isLoadingHistory.value = false;
    }
};

const goBackToList = () => {
    isChatVisible.value = false;
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

        onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            const senderId = parseInt(payload.data.sender_id);
            if (senderId && (!selectedUser.value || selectedUser.value.id !== senderId)) {
                const user = users.value.find(u => u.id === senderId);
                if (user) {
                    user.hasNewMessage = true;
                }
            }
        });

    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
    }
}


const connectWebSocket = () => {
    if (!token.value) return;

    const rawToken = token.value.startsWith('Bearer ') ? token.value.substring(7) : token.value;
    const wsUrl = `${getWebSocketUrl()}?token=${rawToken}`;

    socket.value = new WebSocket(wsUrl);

    socket.value.onopen = () => console.log('WebSocket connected');

    socket.value.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (selectedUser.value && message.senderId === selectedUser.value.id) {
            messages.value.push(message);
            scrollToBottom();
        } else {
            const user = users.value.find(u => u.id === message.senderId);
            if (user) {
                user.hasNewMessage = true;
            }
        }
    };

    socket.value.onclose = () => console.log('WebSocket disconnected');
    socket.value.onerror = (error) => console.error('WebSocket error:', error);
};

const sendMessage = () => {
    if (newMessage.value.trim() === '' || !socket.value || !selectedUser.value || socket.value.readyState !== WebSocket.OPEN) {
        return;
    }

    const messagePayload = {
        content: newMessage.value,
        receiverId: selectedUser.value.id,
    };

    socket.value.send(JSON.stringify(messagePayload));

    messages.value.push({
        ...messagePayload,
        senderId: get_auth_user.value.id,
        timestamp: new Date().toISOString()
    });

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

    if (!token.value || !get_auth_user.value?.admin) return;

    try {
        const userList = await get_users_api();
        users.value = userList.filter(u => !u.admin).map(u => ({ ...u, hasNewMessage: false }));
        isLoading.value = false

        connectWebSocket();
        setupFCM();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
});

onUnmounted(() => {
    if (socket.value) {
        socket.value.close();
    }
});
</script>

<template>
    <div class="chat-container" :class="{ 'show-chat': isChatVisible }">
        <div class="user-list-panel">
            <div class="user-list-header">Khách hàng</div>
            <div class="user-list">
                <LoadingSpinner v-if="isLoading" message="Đang tải..." />
                <div v-else v-for="user in users" :key="user.id" class="user-item"
                    :class="{ active: selectedUser && selectedUser.id === user.id }" @click="selectUser(user)">
                    <span class="username">{{ user.username || user.email }}</span>
                    <span v-if="user.hasNewMessage" class="new-message-indicator"></span>
                </div>
            </div>
        </div>

        <div class="chat-panel">
            <template v-if="selectedUser">
                <div class="chat-header">
                    <button class="back-button" @click="goBackToList">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <span>Nhắn tin với {{ selectedUser.username || selectedUser.email }}</span>
                </div>
                <div class="message-list" ref="messageListEl">
                    <LoadingSpinner v-if="isLoadingHistory" message="Đang tải lịch sử..." />
                    <div v-for="msg in messages" :key="msg.ID || msg.timestamp" class="message-item"
                        :class="get_auth_user && msg.senderId === get_auth_user.id ? 'sent' : 'received'">
                        <div class="message-content pre-line-text">{{ msg.content }}</div>
                        <div class="message-timestamp">{{ formatTimestamp(msg.timestamp) }}</div>
                    </div>
                </div>
                <div class="chat-input-area">
                    <textarea 
                        class="chat-input" 
                        :placeholder="`Nhắn tin cho ${selectedUser.username}`"
                        v-model="newMessage" @keydown.enter.prevent.exact="sendMessage" rows="1"
                        @input="autoResizeTextarea"
                        ref="chatInputEl"
                        >
                    </textarea>
                    <button class="btn-primary" @click="sendMessage" :disabled="!newMessage.trim()">Gửi</button>
                </div>
            </template>
        </div>
    </div>
</template>
