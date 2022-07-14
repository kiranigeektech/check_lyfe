In order to create migrations 
npx sequelize-cli init
this will create config, models, migrations, seeders files

Creating Model
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
this will create the model in our model directory

Running Migrations
npx sequelize-cli db:migrate

Undoing Migrations
npx sequelize-cli db:migrate:undo

Undoing Specific Migrations
npx sequelize-cli db:migrate:undo --name name-of-migration-as-in-data

Creating seed file
npx sequelize-cli seed:generate --name demo-user

Running seeds
npx sequelize-cli db:seed:all

Undoing seeds
If you wish to undo the most recent seed:
npx sequelize-cli db:seed:undo

specific seed
npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data

all seeds
npx sequelize-cli db:seed:undo:all

Migrations Skeleton
npx sequelize-cli migration:generate --name migration-skeleton


Eslint 
setting up a configuration file:
./node_modules/.bin/eslint --init

After that run ESLint on any file or directory like this
./node_modules/.bin/eslint yourfile.js