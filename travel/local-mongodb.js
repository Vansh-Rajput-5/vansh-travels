const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
    console.log("Starting Local MongoDB Memory Server...");
    const mongod = await MongoMemoryServer.create({
        instance: { port: 27017 }
    });
    console.log(`\n========================================`);
    console.log(`[SUCCESS] Local MongoDB running!`);
    console.log(`[URI] ${mongod.getUri()}`);
    console.log(`========================================\n`);
    
    // Keep the process running
    process.on('SIGINT', async () => {
        await mongod.stop();
        process.exit();
    });
}

start().catch(console.error);
