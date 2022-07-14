require('dotenv').config()

module.exports = {
    development :{
        username : process.env.MYSQL_DEV_USER,
        password : process.env.MYSQL_DEV_PASSWORD,
        database : process.env.MYSQL_DEV_DATABASE,
        host : process.env.MYSQL_DEV_HOST,
        port : process.env.MYSQL_PORT,
        dialect : process.env.MYSQL_DIALECT,
        pool : {
            max : parseInt(process.env.MYSQL_POOL_MAX_CONNECTION),
            min : parseInt(process.env.MYSQL_POOL_MIN_CONNECTION),
            acquire: parseInt(process.env.MYSQL_POOL_ACQUIRE),
            idle : parseInt(process.env.MYSQL_POOL_IDLE)
        }
    },
    staging : {
        username : process.env.MYSQL_STAG_USER,
        password : process.env.MYSQL_STAG_PASSWORD,
        database : process.env.MYSQL_STAG_DATABASE,
        host : process.env.MYSQL_STAG_HOST,
        port : process.env.MYSQL_PORT,
        dialect : process.env.MYSQL_DIALECT,
        pool : {
            max : parseInt(process.env.MYSQL_POOL_MAX_CONNECTION),
            min : parseInt(process.env.MYSQL_POOL_MIN_CONNECTION),
            acquire: parseInt(process.env.MYSQL_POOL_ACQUIRE),
            idle : parseInt(process.env.MYSQL_POOL_IDLE)
        }
    },
    production : {
        username : process.env.MYSQL_PROD_USER,
        password : process.env.MYSQL_PROD_PASSWORD,
        database : process.env.MYSQL_PROD_DATABASE,
        host : process.env.MYSQL_PROD_HOST,
        port : process.env.MYSQL_PORT,
        dialect : process.env.MYSQL_DIALECT,
        pool : {
            max : parseInt(process.env.MYSQL_POOL_MAX_CONNECTION),
            min : parseInt(process.env.MYSQL_POOL_MIN_CONNECTION),
            acquire: parseInt(process.env.MYSQL_POOL_ACQUIRE),
            idle : parseInt(process.env.MYSQL_POOL_IDLE)
        }
    }
}