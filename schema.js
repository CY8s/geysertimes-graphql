/* import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} from 'graphql' */

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require('graphql')

const GeyserType = new GraphQLObjectType({
  name: 'Geyser',
  description: '...',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    latitude: {
      type: GraphQLString
    },
    longitude: {
      type: GraphQLString
    },
    eruptions: {
      type: GraphQLList(EruptionType),
      args: {
        range: {
          type: GraphQLInt
        },
        offset: {
          type: GraphQLInt
        }
      },
      resolve: (geyser, args, { loaders }) =>
        loaders.recentEruptions.load({ ...args, geysers: [geyser.id] })
    },
    lastEruption: {
      type: EruptionType,
      resolve: (geyser, args, { loaders }) =>
        loaders.lastEruption.load(geyser.id)
    },
    prediction: {
      type: PredictionType,
      resolve: (geyser, args, { loaders }) =>
        loaders.prediction.load(geyser.id)
    }
  })
})

const PredictionType = new GraphQLObjectType({
  name: 'Prediction',
  description: '...',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: prediction => prediction.predictionID
    },
    geyser: {
      type: GeyserType,
      resolve: (prediction, args, { loaders }) =>
        loaders.geyser.load(prediction.geyser)
    },
    time: {
      type: GraphQLString,
      resolve: prediction => prediction.prediction
    },
    windowOpen: {
      type: GraphQLString
    },
    windowClose: {
      type: GraphQLString
    },
    plusMinus: {
      type: GraphQLString,
      resolve: prediction =>
        (parseInt(prediction.prediction) - parseInt(prediction.windowOpen)) /
        60
    }
  })
})

const EruptionType = new GraphQLObjectType({
  name: 'Eruption',
  description: '...',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: eruption => eruption.eruptionID
    },
    geyser: {
      type: GeyserType,
      resolve: (eruption, args, { loaders }) =>
        loaders.geyser.load(eruption.geyserID)
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
      resolve: (root, args, { loaders }) => loaders.geyser.load(args.id)
    },
    geysers: {
      type: GraphQLList(GeyserType),
      args: {
        ids: {
          type: new GraphQLList(GraphQLString)
        }
      },
      resolve: (root, args, { loaders }) => loaders.geysers.load(args)
    },
    predictions: {
      type: GraphQLList(PredictionType),
      args: {
        userID: {
          type: GraphQLString,
          defaultValue: '44'
        },
        geysers: {
          type: new GraphQLList(GraphQLString)
        }
      },
      resolve: (root, args, { loaders }) => loaders.predictions.load(args)
    },
    prediction: {
      type: PredictionType,
      args: {
        geyser: { type: GraphQLString }
      },
      resolve: (root, args, { loaders }) =>
        loaders.prediction.load(args.geyser)
    },
    eruptions: {
      type: GraphQLList(EruptionType),
      args: {
        geysers: {
          type: new GraphQLList(GraphQLString)
        },
        range: {
          type: GraphQLInt
        },
        offset: {
          type: GraphQLInt
        }
      },
      resolve: (root, args, { loaders }) => loaders.recentEruptions.load(args)
    },
    eruption: {
      type: EruptionType,
      args: {
        id: { type: GraphQLString }
      },
      resolve: (root, args, { loaders }) => loaders.eruption.load(args.id)
    }
  })
})

/* export default new GraphQLSchema({
    query: QueryType
}) */

module.exports = new GraphQLSchema({
  query: QueryType
})
