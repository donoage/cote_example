<template>
    <section class="tile is-ancestor">
        <div class="tile is-vertical is-8">
            <div class="tile">
                <ProductList/>
            </div>
        </div>
        <div class="tile">
            <div class="tile">
                <PurchaseList/>
            </div>
        </div>
    </section>
</template>

<script>
import ProductList from './ProductList.vue';
import PurchaseList from './PurchaseList.vue';

export default {
  name: 'Main',
  components: {
    ProductList,
    PurchaseList,
  },
};
</script>

<style scoped>

</style>
