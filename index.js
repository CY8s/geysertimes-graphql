import DataLoader from 'dataloader';

import express from 'express';
import fetch from 'node-fetch';
import graphqlHTTP from 'express-graphql';
import schema from './schema';

const BASE_URL = 'https://www.geysertimes.org/api/v5';

let geysers;

async function getGeysers(refresh = false) {
    if (refresh || !geysers) {
        console.log("Load");
        geysers = await fetch(`${BASE_URL}/geysers`)
            .then(res => res.json())
            .then(json => json.geysers || [])
            //.then(res => res)
    }

    return geysers;
}

async function getGeyserByID(id) {

    geysers = await getGeysers();

    let match = geysers.find(geyser => geyser['id'] == id);

    if (match) {
        return match;
    }

    geysers = await getGeysers(true);

    return geysers.find(geyser => geyser['id'] == id);
}

function getEruptionByURL(relativeURL) {
    return fetch(`${BASE_URL}${relativeURL}`)
        .then(res => res.json())
        .then(json => json.entries.length ? json.entries[0] : null)
}

function getPredictionByURL(relativeURL) {
    return fetch(`${BASE_URL}${relativeURL}`)
        .then(res => res.json())
        .then(json => json.predictions.length ? json.predictions[0] : null)
}

const app = express();

app.use(graphqlHTTP(req => {
    const geyserLoader = new DataLoader(
        keys => Promise.all(keys.map(getGeyserByID))
    )
    const predictionLoader = new DataLoader(
        keys => Promise.all(keys.map(getPredictionByURL))
    )

    const eruptionLoader = new DataLoader(
        keys => Promise.all(keys.map(getEruptionByURL))
    )

    const loaders = {
        geyser: geyserLoader,
        prediction: predictionLoader,
        eruption: eruptionLoader
    }
    return {
        context: {loaders},
        schema,
        graphiql: true,
    }
}))

app.listen(5000) 