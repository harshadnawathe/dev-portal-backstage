/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {errorHandler} from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import {Logger} from 'winston';
import * as zlib from "zlib";
import * as fileSystem from "fs"
import path from "path";
import unzip from "./fileReader";

const _importDynamic = new Function('modulePath', 'return import(modulePath)')

async function fetch(...args: any[]) {
    const {default: fetch} = await _importDynamic('node-fetch')
    return fetch(...args)
}

export interface RouterOptions {
    logger: Logger;
}

export async function createRouter(
    options: RouterOptions,
): Promise<express.Router> {
    const {logger} = options;

    const router = Router();
    router.use(express.json());

    router.get('/health', (_, response) => {
        logger.info('PONG!');
        response.send({status: 'ok'});
    });

    router.post('/report', async (request, response) => {
            const zipUrl = request.body.url;
            const zipResponse = await fetch(zipUrl)
            const output = fileSystem.createWriteStream(`${__dirname}/target.zip`);
            zipResponse.body.pipe(output);
            const csvData = await unzip(path.resolve(`${__dirname}/target.zip`))
            response.json(csvData);
        }
    );

    router.use(errorHandler());
    return router;
}
