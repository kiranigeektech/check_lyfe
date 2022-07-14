require("dotenv").config();
const Hapi = require("@hapi/hapi");
const HapiSwagger = require("hapi-swagger");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Pack = require("./package");

// Global Variables
global.Boom = require("boom");
global.Joi = require("joi");
global.Bcrypt = require("bcrypt");
global.Sequelize = require("sequelize");
// global.URL = require("url-parse");
global.Fs = require("fs");
global.Path = require("path");
global.Jwt = require("jsonwebtoken");
global.Constants = require("./config/constant");
global.Models = require("./models");
global.Colors = require("colors/safe");
global.Op = Sequelize.Op;
global.Moment = require("moment");
global.UniversalFunctions = require("./universalFunctions/lib");
global._ = require("lodash");

const server = new Hapi.server({
	host: process.env.NODE_HOST,
	port: process.env.NODE_PORT,
	routes: {
		cors: {
			origin: ['*'],
			headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match',"language","timezone"],
			additionalHeaders: ["Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type", 'cache-control', 'x-requested-with']
			}
	}
});

const init = async function () {
	const swaggerOptions = {
		info: {
			title: process.env.PROJECT_TITLE,
			version: Pack.version
		},
		securityDefinitions: {
			Bearer: {
				type: "apiKey",
				name: "Authorization",
				in: "header"
			}
		},
		schemes: ["https", "https"],
		grouping: "tags",
		sortEndpoints: "ordered",
		consumes: ["application/json"],
		produces: ["application/json"]
	};
	console.log(Colors.green("Register swagger for API documentation..."));
	await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: swaggerOptions
		}
	]);
	try {
		console.log(Colors.green("Register jwt library"));
		await server.register(require("hapi-auth-jwt2"));
		server.auth.strategy("jwt", "jwt", {
			complete: true,
			key: Constants.key.privateKey, // secret key
			validate: UniversalFunctions.validateToken, // validate function defined in Universal function for checking
			verifyOptions: { algorithms: ["HS256"] } // algorithm
		});
		server.auth.default("jwt");
		console.log(Colors.green("Initializing routes..."));
		await server.register({
			plugin: require("hapi-auto-route"),
			options: {
				routes_dir: Path.join(__dirname, "routes")
			}
		});

		console.log(Colors.green("Checking DB connectivity..."));
		try {
			await Models.sequelize.authenticate();
		} catch (err) {
			console.log(err)
			console.log(Colors.red("Connection to db could not be established"));
			process.exit();
			return {};
		}
		console.log(Colors.green("Register proxy h2o2..."));
		await server.register({ plugin: require("@hapi/h2o2") });
		console.log(Colors.green("Register i18n"));
		await server.register({
			plugin: require("hapi-i18n"),
			options: {
				locales: ["ar", "en"],
				directory: __dirname + "/locales",
				languageHeaderField: "language",
				defaultLocale: "en"
			}
		});
		console.log(Colors.green("Synchronizing models..."));
		// Models.sequelize.sync().then(() => {
			server.start(() => {
				console.log(
					Colors.green(
						"Hapi server for Project user servicestarted @",
						server.info.uri
					)
				);
			});
		// });
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
	console.log(Colors.green("Server running at:", server.info.uri));
};
init();
