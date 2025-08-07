import router from '@/router';

export const formatPrice = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const goToDetailProduct = (productId) => {
  router.push({ name: 'product-detail', params: { id: productId } });
};