// THIS ROOT INDEX FILE JUST RUNS BOTH CLIENT AND SERVER FOR DEVELOPMENT PURPOSES

import Server from './server/server';
import DotEnv from 'dotenv';

DotEnv.config({
    path: '.env'
});

function main(): void {
    const server = new Server();

    server.init({
        sPort: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000,
        wsPort: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001,
    });
}

// Run the main function.
main();