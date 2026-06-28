const { createClient} = require('redis');

const redisClient = createClient({
    url:process.env.REDIS_URL,
})

redisClient.on('error',(err)=>{
    console.error('redis error',err)
})

redisClient.on('connect',()=>{
    console.log('redis connected')
})

const connectRedis = async ()=>{
    await redisClient.connect();
}
module.exports = {
    redisClient,
    connectRedis
}