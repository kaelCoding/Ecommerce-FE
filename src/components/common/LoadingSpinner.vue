<script setup>
    defineProps({
        message: {
            type: String,
            default: 'Đang tải...',
        },
    });
</script>
    
<template>
    <div class="loading-state">
        <div class="spinner"></div>
        <p>{{ message }}</p>
    </div>
</template>


<style scoped>
.loading-state {
    text-align: center;
    padding: 50px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--light-gray-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>