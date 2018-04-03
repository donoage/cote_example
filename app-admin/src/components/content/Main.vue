<template>
    <section class="tile is-ancestor">
        <div class="tile is-vertical is-8">
            <div class="tile">
                <ProductCreate/>
                <ProductList/>
            </div>
            <div class="tile">
                <PurchaseList/>
            </div>
        </div>
        <div class="tile is-parent">
            <UserList/>
        </div>
    </section>
</template>

<script>
import UserList from './UserList.vue';
import ProductCreate from './ProductCreate.vue';
import ProductList from './ProductList.vue';
import PurchaseList from './PurchaseList.vue';

export default {
  name: 'Main',
  components: {
    ProductCreate,
    ProductList,
    UserList,
    PurchaseList,
  },
};
</script>

<style scoped>

</style>
