import './env';
import './logger';
import applyApp from './applyApp';
import express from 'express';

const PORT = 4000;

(async () => {
    const app = express();  
    applyApp(app);
    const server = app.listen(PORT, console.log(`> 🚀 App listening on http://localhost:${PORT}`));

    // https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
    //load balancer idle timeout is set to 60 seconds
    //nginx keepalive_timeout is set to 65 seconds
    server.keepAliveTimeout = 67000;
    server.headersTimeout = 68000;
})(); 