const typeDefs = [`
  type User {
    _id: String
    name: String
    balance: Int
    purchases: [Purchase]
    picUrl: String
  }

  type Product {
    _id: String
    name: String
    price: Int
    stock: Int
    purchases: [Purchase]
  }
  
 type Purchase {
    _id: String
    userId: String
    productId: String
    product: Product
    user: User
  }
  
  type Query {
    user(_id: String): User
    users: [User]
    
    product(_id: String): Product
    products: [Product]
    
    purchase(_id: String): Purchase
    purchases(userId: String): [Purchase]
  }
  
  type Mutation {
    createUser(balance: Int, name: String, picUrl: String): User
    updateUserBalance(_id: String, balance: Int): User
    
    createProduct(price: Int, stock: Int, name: String): Product
    updateProductStock(_id: String, stock: Int): Product
    deleteProduct(_id: String): Product
    
    createPurchase(userId: String, productId: String): Purchase
  }
  
  type Subscription {
    userCreated: User
    
    productCreated: Product
    productUpdated: Product
    productDeleted: Product
    
    purchaseCreated: Purchase
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`];

module.exports = typeDefs;
