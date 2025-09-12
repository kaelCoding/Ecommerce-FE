<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { searchProductsAPI } from '@/services/product';
import Card from '@/components/product/Card.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const products = ref([]);
const isLoading = ref(false);
const searchQuery = ref(route.query.q || '');

const performSearch = async (query) => {
    if (!query) {
        products.value = [];
        return;
    }
    isLoading.value = true;
    try {
        products.value = await searchProductsAPI(query);
    } catch (error) {
        console.error('Failed to fetch search results:', error);
        products.value = [];
    } finally {
        isLoading.value = false;
    }
};

watch(
    () => route.query.q,
    (newQuery) => {
        searchQuery.value = newQuery;
        performSearch(newQuery);
    },
    { immediate: true }
);

</script>

<template>
    <div class="search-page-container">
        <div class="container">
            <LoadingSpinner v-if="isLoading" :message="t('navbar.loading')" />
            <div v-else>
                <div class="search-header">
                    <h1 v-if="searchQuery">
                        {{ t('search.searchQuery') }} : "<strong>{{ searchQuery }}</strong>"
                    </h1>
                    <h1 v-else>
                        {{ t('search.searchKey') }}
                    </h1>
                    <p v-if="products.length > 0" class="results-count">
                        {{ t('search.searchFind') }} {{ products.length }} {{ t('search.searchProduct') }}
                    </p>
                </div>

                <div v-if="products.length > 0" class="products-grid">
                    <Card v-for="product in products" :key="product.ID" :product="product" />
                </div>
                <div v-else-if="searchQuery" class="empty-state">
                    <i class="fa-solid fa-box-open"></i>
                    <p>{{ t('search.searchEmpty') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-page-container {
    padding: 60px 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.search-header {
    margin-bottom: 30px;
    text-align: center;
}

.search-header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--secondary-color);
}

.results-count {
    font-size: 1.1rem;
    color: var(--text-color);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
    color: var(--text-color);
    text-align: center;
}

.empty-state .fa-box-open {
    font-size: 3rem;
    margin-bottom: 20px;
    color: var(--primary-color);
}

.empty-state p {
    font-size: 1.2rem;
}

@media (max-width: 600px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .search-header h1 {
        font-size: 1.5rem;
    }
}
</style>