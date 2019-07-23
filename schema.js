/*import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} from 'graphql'*/

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');


const GeyserType = new GraphQLObjectType({
    name: 'Geyser',
    description: '...',
    fields: () => ({
        name: {
            type: GraphQLString
        },
        latitude: {
            type: GraphQLString
        },
        longitude: {
            type: GraphQLString
        },
        lastEruption: {
            type: EruptionType,
            args: {
                id: { type: GraphQLString }
            },
            resolve: (geyser, args, {loaders}) =>
                loaders.lastEruption.load(geyser.id)
        },
        prediction: {
            type: PredictionType,
            resolve: (geyser, args, {loaders}) =>
                loaders.prediction.load(geyser.id)
        }
    })
})

const PredictionType = new GraphQLObjectType({
    name: 'Prediction',
    description: '...',
    fields: () => ({
        geyser: {
            type: GeyserType,
            resolve: (prediction, args, {loaders}) =>
                loaders.geyser.load(prediction.geyserID)
        },
        time: {
            type: GraphQLString,
            resolve: prediction => prediction.prediction
        }
    })
})

const EruptionType = new GraphQLObjectType({
    name: 'Eruption',
    description: '...',
    fields: () => ({
        geyser: {
            type: GeyserType,
            resolve: (prediction, args, {loaders}) =>
                loaders.geyser.load(prediction.geyserID)
        },
        time: {
            type: GraphQLString
        },
        comment: {
            type: GraphQLString
        }
    })
})

const QueryType = new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
        geyser: {
            type: GeyserType,
            args: {
                id: { type: GraphQLString }
            },
            resolve: (root, args, {loaders}) =>
                loaders.geyser.load(args.id)
        },
        prediction: {
            type: PredictionType,
            args: {
                id: { type: GraphQLString }
            },
            resolve: (root, args, {loaders}) =>
                loaders.prediction.load(args.id)
        },
        eruption: {
            type: EruptionType,
            args: {
                id: { type: GraphQLString }
            },
            resolve: (root, args, {loaders}) =>
                loaders.eruption.load(args.id)
        }
    })
})

/*export default new GraphQLSchema({
    query: QueryType
})*/

module.exports = new GraphQLSchema({
    query: QueryType
});