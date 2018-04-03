<template>
    <div class="tile is-parent is-vertical">
        <article class="tile is-child box">
            <p class="title">
                Create
                <i class="fas fa-plus fas is-pulled-right"></i>
            </p>
            <p class="subtitle">Product</p>
            <div class="content">
                <form @submit="checkForm">
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control has-icons-left">
                            <input class="input" type="text" value="" v-model="newProduct.name">
                            <span class="icon is-small is-left">
                              <i class="fas fa-tag"></i>
                            </span>
                        </div>
                        <p class="help is-danger" v-if="errors.name.length">{{errors.name}}</p>
                    </div>
                    <div class="field">
                        <label class="label">Price</label>
                        <div class="control has-icons-left">
                            <input class="input" type="text" value="" v-model="newProduct.price">
                            <span class="icon is-small is-left">
                              <i class="fas fa-dollar-sign"></i>
                            </span>
                        </div>
                        <p class="help is-danger" v-if="errors.price.length">{{errors.price}}</p>
                    </div>
                    <div class="field">
                        <label class="label">Stock</label>
                        <div class="control has-icons-left">
                            <input class="input" type="text" value="" v-model="newProduct.stock">
                            <span class="icon is-small is-left">
                              <i class="fas fa-sort-numeric-up"></i>
                            </span>
                        </div>
                        <p class="help is-danger" v-if="errors.stock.length">{{errors.stock}}</p>
                    </div>
                    <div class="field">
                        <input type="submit" value="Submit"
                               class="button is-warning is-pulled-right">
                    </div>
                </form>
            </div>
        </article>
    </div>
</template>
<script>
import ProductCreate from '../../graphql/ProductCreate.gql';

export default {
  name: 'ProductCreate',
  methods: {
    checkForm(e) {
      e.preventDefault();
      this.resetErrors();

      if (this.newProduct.name && this.newProduct.price && this.newProduct.stock) {
        this.createProduct();
      } else {
        if (!this.newProduct.name.trim()) this.$data.errors.name = 'Name required.';
        if (!this.newProduct.price.trim()) this.$data.errors.price = 'Price required.';
        if (!this.newProduct.stock.trim()) this.$data.errors.stock = 'Stock required.';
      }
    },
    createProduct() {
      this.$apollo.mutate({
        mutation: ProductCreate,
        variables: {
          name: this.newProduct.name,
          price: this.newProduct.price,
          stock: this.newProduct.stock,
        },
      }).then((data) => {
        console.log(data);
      }).catch((error) => {
        console.log(error);
      });
      this.resetData();
    },
    resetData() {
      Object.assign(this.$data, this.$options.data.call(this));
    },
    resetErrors() {
      const initialData = this.$options.data.call(this);
      Object.assign(this.$data.errors, initialData.errors);
    },
  },
  data() {
    return {
      newProduct: {
        name: '',
        price: '',
        stock: '',
      },
      errors: {
        name: '',
        price: '',
        stock: '',
      },
    };
  },
};
</script>

<style scoped>
    h3 {
        margin: 40px 0 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
