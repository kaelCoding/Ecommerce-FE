import { defineStore } from 'pinia';
import { getRewardsApi, addRewardApi, updateRewardApi, deleteRewardApi, spinByShippingCodeApi } from '@/services/spin';
import { useNotification } from '@/composables/useNotification';

const { showNotification } = useNotification();

export const useSpinStore = defineStore('spin', {
    state: () => ({
        rewards: [],
        isLoading: {
            all: false,
            spin: false,
        },
        error: null,
    }),
    actions: {
        async fetchRewards() {
            this.isLoading.all = true;
            this.error = null;
            try {
                const data = await getRewardsApi();
                this.rewards = data || [];
            } catch (err) {
                this.error = err || "Failed to fetch rewards.";
                showNotification(this.error, 'error');
            } finally {
                this.isLoading.all = false;
            }
        },
        async addReward(rewardData) {
            this.isLoading.all = true;
            this.error = null;
            try {
                const newRewardResponse = await addRewardApi(rewardData);
                this.rewards.push(newRewardResponse.reward);
                showNotification("Phần thưởng đã được thêm thành công!", 'success');
            } catch (err) {
                this.error = err || "Failed to add reward.";
                showNotification(this.error, 'error');
                throw new Error(this.error);
            } finally {
                this.isLoading.all = false;
            }
        },
        async updateReward(rewardId, rewardData) {
            this.isLoading.all = true;
            this.error = null;
            try {
                const updatedRewardResponse = await updateRewardApi(rewardId, rewardData);
                const index = this.rewards.findIndex(r => r.ID === rewardId); 
                if (index !== -1) {
                    this.rewards[index] = updatedRewardResponse.reward;
                }
                showNotification("Phần thưởng đã được cập nhật thành công!", 'success');
            } catch (err) {
                this.error = err || "Failed to update reward.";
                showNotification(this.error, 'error');
                throw new Error(this.error);
            } finally {
                this.isLoading.all = false;
            }
        },
        async deleteReward(rewardId) {
            this.isLoading.all = true;
            this.error = null;
            try {
                await deleteRewardApi(rewardId);
                this.rewards = this.rewards.filter(r => r.ID !== rewardId);
                showNotification("Phần thưởng đã được xóa thành công!", 'success');
            } catch (err) {
                this.error = err || "Failed to delete reward.";
                showNotification(this.error, 'error');
                throw new Error(this.error);
            } finally {
                this.isLoading.all = false;
            }
        },
        async spinWheel(shippingCode) {
            this.isLoading.spin = true;
            this.error = null;
            try {
                const result = await spinByShippingCodeApi(shippingCode);
                showNotification("Chúc mừng! Bạn đã trúng thưởng!", 'success');
                return result.reward;
            } catch (err) {
                this.error = err || "Failed to spin the wheel.";
                showNotification(this.error, 'error');
                return null;
            } finally {
                this.isLoading.spin = false;
            }
        }
    }
});