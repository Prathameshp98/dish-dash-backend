
const User = require('../models/user.js');
const Dish = require('../models/dish.js');

const {
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString,
    GraphQLSchema, 
    GraphQLList,
    GraphQLNonNull,
} = require('graphql');

// User Type
const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        dishId: { type: new GraphQLList(GraphQLString) }
        // foodId: {
        //     type: dishType,
        //     resolve(parent, args) {
        //         return parent.foodId.map((each, index) => {
        //             return foodData.find(food => food.id === parent.foodId[index])
        //         })
                
        //     }
        // }
    })
});

// Food Type
const dishType = new GraphQLObjectType({
    name: 'Dish',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        dishImage: { type: GraphQLString },
        ingredients: { type: GraphQLString },
        instructions: { type: GraphQLString },
        time: { type: GraphQLString },
        category: { type: GraphQLString },
        type: { type: GraphQLString },
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        dishes: {
            type: new GraphQLList(dishType),
            resolve(parent, args) {
                return Dish.find()
            }
        },
        dish: {
            type: dishType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Dish.findById(args.id)
            },
        },
        users: {
            type: new GraphQLList(userType),
            resolve(parent, args) {
                return User.find();
            }
        },
        user: {
            type: userType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args.id);
            },
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addDish: {
            type: dishType,
            args: {
               name: { type: new GraphQLNonNull(GraphQLString) }, 
               dishImage: { type: new GraphQLNonNull(GraphQLString) }, 
               ingredients: { type: new GraphQLNonNull(GraphQLString) }, 
               instructions: { type: new GraphQLNonNull(GraphQLString) }, 
               time: { type: new GraphQLNonNull(GraphQLString) }, 
               category: { type: new GraphQLNonNull(GraphQLString) }, 
               type: { type: new GraphQLNonNull(GraphQLString) }, 
               userId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args){
                const dish = new Dish({
                    name: args.name,
                    dishImage: args.dishImage,
                    ingredients: args.ingredients,
                    instructions: args.instructions,
                    time: args.time,
                    category: args.category,
                    type: args.type,
                    userId: args.userId
                });

                return dish.save();
            }
        },

        updateDish: {
            type: dishType,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString }, 
                dishImage: { type: GraphQLString }, 
                ingredients: { type: GraphQLString }, 
                instructions: { type: GraphQLString }, 
                time: { type: GraphQLString }, 
                category: { type: GraphQLString }, 
                type: { type: GraphQLString }, 
            },
            resolve(parent, args){
                return Dish.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            dishImage: args.dishImage,
                            ingredients: args.ingredients,
                            instructions: args.instructions,
                            time: args.time,
                            category: args.category,
                            type: args.type
                        }
                    }
                )
            }
        },

        deleteDish: {
            type: dishType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                Dish.findByIdAndRemove(args.id).then((res) => {
                    return User.updateOne({ dishId: args.id }, { $pull: { dishId: args.id }})
                })     
            }
        },

        addUser: {
            type: userType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) }, 
                email: { type: new GraphQLNonNull(GraphQLString) }, 
                password: { type: new GraphQLNonNull(GraphQLString) }, 
                dishId: { type: new GraphQLList(GraphQLString) }, 
            },
            resolve(parent, args) {
                const user = new User({
                    name: args.name,
                    email: args.email,
                    password: args.password,
                    dishId: args.dishId,
                });

                return user.save();
            }
        },

        updateUser: {
            type: userType,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            resolve(parent, args) {
                return User.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            email: args.email,
                            password: args.password
                        }
                    }
                )
            }
        },

        deleteUser: {
            type: userType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {

                Dish.find({ userId: args.id }).then((dishes) => {
                    dishes.forEach((dish) => {
                        dish.deleteOne();
                    })
                })

                return User.findByIdAndRemove(args.id)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})
