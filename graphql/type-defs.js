const typeDefs = [`
          type Query {
            user(_id: String): User
            users: [User]
            
            product(_id: String): Product
            products: [Product]
            
            purchase(_id: String): Purchase
            purchases: [Purchase]
          }
    
          type User {
            _id: String
            name: String
            balance: Int
            purchases: [Purchase],
            pic_url: String
          }
    
          type Product {
            _id: String
            name: String
            price: Int
            stock: Int
          }
          
         type Purchase {
            _id: String
            userId: String
            productId: String
          }
    
          type Mutation {
            createUser(balance: Int, name: String, pic_url: String): User
            updateUserBalance(_id: String, balance: Int): User
            
            createProduct(price: Int, stock: Int, name: String): Product
            updateProductStock(_id: String, stock: Int): Product
            deleteProduct(_id: String): Product
            
            createPurchase(userId: String, productId: String): Purchase
          }
    
          schema {
            query: Query
            mutation: Mutation
          }
        `];

module.exports = typeDefs;