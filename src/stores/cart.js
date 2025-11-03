import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCartAPI, addToCartAPI, updateCartItemAPI, deleteCartItemAPI } from '@/services/cart';
import { formatPrice } from '@/composables/useUtils';
import { get_auth_user } from '@/stores/auth'; 

export const useCartStore = defineStore('cart', () => {
  const items = ref([]); 
  const isLoading = ref(false);
  
  const authUser = get_auth_user;
  const discountPercentage = computed(() => {
    return authUser.value?.discountPercentage || 0;
  });

  async function fetchCart() {
    isLoading.value = true;
    try {
      const response = await getCartAPI();
      items.value = response.cartItems || [];
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      items.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function addItem(productId, quantity) {
    isLoading.value = true;
    try {
      await addToCartAPI({ productId, quantity });
      await fetchCart();
    } catch (error) {
      console.error("Failed to add item:", error);
      throw error; 
    } finally {
      isLoading.value = false;
    }
  }

  async function updateItemQuantity(itemId, quantity) {
    isLoading.value = true;
    try {
      await updateCartItemAPI(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeItem(itemId) {
    isLoading.value = true;
    try {
      await deleteCartItemAPI(itemId);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function clearCart() {
    items.value = [];
  }

  const cartTotalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // ##### ĐÃ CẬP NHẬT LOGIC TÍNH GIÁ #####
  const cartTotalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      const originalPrice = parseFloat(item.product.price) || 0;
      // Áp dụng giảm giá cho từng sản phẩm
      const discountedPrice = originalPrice * (1 - discountPercentage.value);
      return sum + (discountedPrice * item.quantity);
    }, 0);
  });
  
  // Tính tổng giá gốc (để hiển thị gạch ngang nếu cần)
  const cartOriginalTotalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
        const price = parseFloat(item.product.price) || 0;
        return sum + (price * item.quantity);
    }, 0);
  });
  
  const formattedCartTotalPrice = computed(() => {
      return formatPrice(cartTotalPrice.value);
  });

  return {
    items,
    isLoading,
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    cartTotalItems,
    cartTotalPrice,
    formattedCartTotalPrice,
    // Trả về thêm các giá trị này để CartView/CheckoutView có thể dùng
    cartOriginalTotalPrice, 
    discountPercentage 
  };
});