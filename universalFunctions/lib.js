const crypto = require("crypto");
const { v1: uuidv1 } = require('uuid');
const imageThumbnail = require('image-thumbnail');
const Constants = require("../config/constant");
/*  var FCM = require('fcm-node');
var serverKey = Constants.FCM_KEY.key;
var fcm = new FCM(serverKey);   */

// Method to encrypt data(password).
exports.jsonParse=(data) =>{
	try {
		return JSON.parse(data);
		console.log(data)
	} catch (error) {

		return [];
	}
}

exports.encrypt = (text) => {
	let cipher = crypto.createCipheriv(Constants.algorithm, Constants.key.privateKey, Constants.iv);
	let crypted = cipher.update(text, "utf8", "hex");
	crypted += cipher.final("hex");
	return crypted;
};

const encrypt =(text)=>{

	let cipher = crypto.createCipheriv(Constants.algorithm, Constants.key.privateKey, Constants.iv);
	let crypted = cipher.update(text, "utf8", "hex");
	crypted += cipher.final("hex");
	return crypted;
}

const decrypt = (text) => {
	//const iv = new Buffer(crypto.randomBytes(16));
	let decipher = crypto.createDecipheriv(Constants.algorithm, Constants.key.privateKey, Constants.iv);
	let dec = decipher.update(text, "hex", "utf8");
	dec += decipher.final("utf8");
	return dec;
};

exports.decryptData = async (text) => {
	//const iv = new Buffer(crypto.randomBytes(16));
	try{
		let decipher = crypto.createDecipheriv(Constants.algorithm, Constants.key.privateKey, Constants.iv);
		let dec = decipher.update(text, "hex", "binary");
		 dec += decipher.final("binary");
		return dec;
	}catch(err){
		return err
	}
};


const sessionExist = async (sessionId) =>{
	let data = await Models.userAccesses.findOne(
		{where: {id : sessionId}}
	);
	return data;
};


// Method to validate token
exports.validateToken = async (token, request, h) => {
	try{
		let fetchtoken = JSON.parse(decrypt(token.data));
		var diff = Moment().diff(Moment(token.iat * 1000));
		if (diff > 0) {
			const userInfo = await Models.users.findOne({
				where: { id: fetchtoken.userId }
			});

			let sessionCheck = await sessionExist(fetchtoken.sessionId);
			if(!sessionCheck){
				return {
					isValid : false
				};
			}else{
				return{
					isValid : true,
					credentials: { userData: fetchtoken, scope: fetchtoken.scope }
				};
			} 	
		}
	}catch(e){
		console.log(e);
	}
};

// Method to Sign token with private key
exports.signToken = (tokenData) => {
	return Jwt.sign(
		{ data: encrypt(JSON.stringify(tokenData)) },
		//{data: tokenData},
		Constants.key.privateKey
	);
};

// Method to update validation response from Joi
exports.updateFailureError = (err, req) => {
	const updatedError = err;
	updatedError.output.payload.message = [];
	let customMessages = {};

	if (err.isJoi && Array.isArray(err.details) && err.details.length > 0){
		err.details.forEach((error) => {
			customMessages[error.context.label] = [req.i18n.__(error.message)];
		});
	}else{
		customMessages = req.i18n.__(err.output.payload.validation.source);
	}
		
	// let custMessage = err.stack.split('at')[0];
	// let modifyCustMessage = custMessage.split(`:`)[1];
	// let customMessage = modifyCustMessage.split("\"");
	// console.log(custMessage);
	
	delete updatedError.output.payload.validation;
	updatedError.output.payload.error = "Bad Request";
	updatedError.output.payload.message = req.i18n.__(
		"ERROR_WHILE_VALIDATING_REQUEST"
	);
	//updatedError.output.payload.errors = req.i18n.__(modifyCustMessage);
	updatedError.output.payload.errors = customMessages;
	return updatedError;
};

exports.headers = (optional) => {
	let Globalheaders = {};
	if (optional) {
	  Globalheaders = {
			authorization: Joi.string()
		  .optional()
		  .description(
					"Token to identify user who is performing the action [optional]"
		  ),
		  language: Joi.string().optional(),
		deviceType:Joi.string().optional(),
		timeZone: Joi.number().optional()
	  };
	} else {
	  Globalheaders = {
			authorization: Joi.string()
		  .required()
		  .description("Token to identify user who is performing the action"),
		  language: Joi.string().optional(),
		  timeZone: Joi.number().optional()
	  };
	}
  
	return Globalheaders;
};

exports.getTotalPages = async (records, perpage) => {
	let totalPages = Math.ceil(records / perpage);
	return totalPages;
};

exports.exception = async (req, message, err) => {
	return Boom.badImplementation(
	  req.i18n.__("SOMETHING_WENT_WRONG_WITH_EXCEPTION"),
	  err
	);
};

// Method to make destination directory if not exists
const makeDirectory = (path) => { 
	return new Promise(async (resolve, reject) => {
	  Fs.mkdir(path, { recursive: true }, (err) => {
		if (err) {  
		  return resolve(true);
		} else {
		  return resolve(true);
		}
	  });
	});
};
  
// Method to write file at destination directory  
const writeFile = (destination, filename, data) => {
	return new Promise(async (resolve, reject) => {
	  await Fs.writeFile(destination + "/" + filename, data, (err) => {
		if (err) {
		  return reject(false);
		}
		return resolve(true);
	  });
	});
};
  
// Method to fetch file details
const fileStats = (destination, filename) => {
	return new Promise(async (resolve, reject) => {
	  await Fs.stat(destination + "/" + filename, (err, stats) => {
		if (err) {
		  return reject(false);
		}
		return resolve(stats);
	  });
	});
};

exports.handleFileUpload = (file) => {
	console.log(file)
	return new Promise(async (resolve, reject) => {
	  const UTCDate = new Date();
	  const year = UTCDate.getUTCFullYear();
	  const month = UTCDate.getUTCMonth();
	  const day = UTCDate.getUTCDate();
	  const hour = UTCDate.getUTCHours();
	  let options = { width: 500, height: 500, jpegOptions: { force:true, quality:100 } }
	  let destination = "resources/attachments";
	  let thumbnailDestination = "resources/attachments/thumbnail"
	  let makeDir = await makeDirectory(destination);
	  let thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + year;
	  thumbnailDestination = thumbnailDestination + "/" + year;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + month;
	  thumbnailDestination = thumbnailDestination + "/" + month;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + day;
	  thumbnailDestination = thumbnailDestination + "/" + day;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + hour;
	  thumbnailDestination = thumbnailDestination + "/" + hour;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  if (makeDir && thumbDir) {
		  console.log('sssssssssssssssssssd',file)
		  if(file instanceof Array){
		if (file[1].hapi.filename instanceof Array) {
			console.log('sssssssssssssssssssssss22332')
		  let uploadedfiles = [];
		/*   for (const fileIndex of file) { */
			console.log('SSSSSSSS')
			var fileIndex = file[1].hapi.filename
			const filename = fileIndex.hapi.filename;
			const extension = Path.extname(filename);
			const uniqueName = uuidv1() + extension;
			const data = fileIndex._data;
			let fileData = await writeFile(destination, uniqueName, data);
			let thumbName = await imageThumbnail(destination+'/'+uniqueName,options);
		  	let thumbData = await writeFile(thumbnailDestination,uniqueName,thumbName);
			let stats = await fileStats(destination, uniqueName);
			if (fileData) {
			  let stats = await fileStats(destination, uniqueName);
			  uploadedfiles.push({
				originalName: filename,
				uniqueName: uniqueName,
				filePath: destination + "/" + uniqueName,
				size: stats.size,
				extension: extension
			  });
			}
		  /* } */
		  return resolve(uploadedfiles);
		}
		 else {
		  const filename = file[1].hapi.filename;
		  const extension = Path.extname(filename);
		  const uniqueName = uuidv1() + extension;
		  const data = file[1]._data;
		  let fileData = await writeFile(destination, uniqueName, data);
		  let thumbName = await imageThumbnail(destination+'/'+uniqueName,options);
		  let thumbData = await writeFile(thumbnailDestination,uniqueName,thumbName);
		  console.log('SSSSSSSSSs',fileData)
		  if (fileData) {
			let stats = await fileStats(destination, uniqueName);
			return resolve({
			  	originalName: filename,
			  	uniqueName: uniqueName,
				filePath: destination + "/" + uniqueName,
				thumbPath : thumbnailDestination + "/" + uniqueName,  
			  	size: stats.size,
			  	extension: extension
			});
		  }
		}
	}
	else{
		if (file.hapi.filename instanceof Array) {
			console.log('sssssssssssssssssssssss22332')
		  let uploadedfiles = [];
		/*   for (const fileIndex of file) { */
			console.log('SSSSSSSS')
			var fileIndex = file.hapi.filename
			const filename = fileIndex.hapi.filename;
			const extension = Path.extname(filename);
			const uniqueName = uuidv1() + extension;
			const data = fileIndex._data;
			let fileData = await writeFile(destination, uniqueName, data);
			let thumbName = await imageThumbnail(destination+'/'+uniqueName);
		  	let thumbData = await writeFile(thumbnailDestination,uniqueName,thumbName);
			let stats = await fileStats(destination, uniqueName);
			if (fileData) {
			  let stats = await fileStats(destination, uniqueName);
			  uploadedfiles.push({
				originalName: filename,
				uniqueName: uniqueName,
				filePath: destination + "/" + uniqueName,
				size: stats.size,
				extension: extension
			  });
			}
		  /* } */
		  return resolve(uploadedfiles);
		}
		else {
			const filename = file.hapi.filename;
			const extension = Path.extname(filename);
			const uniqueName = uuidv1() + extension;
			const data = file._data;
			let fileData = await writeFile(destination, uniqueName, data);
			let thumbName = await imageThumbnail(destination+'/'+uniqueName);
			let thumbData = await writeFile(thumbnailDestination,uniqueName,thumbName);
			console.log('SSSSSSSSSs',fileData)
			if (fileData) {
			  let stats = await fileStats(destination, uniqueName);
			  return resolve({
					originalName: filename,
					uniqueName: uniqueName,
				  filePath: destination + "/" + uniqueName,
				  thumbPath : thumbnailDestination + "/" + uniqueName,  
					size: stats.size,
					extension: extension
			  });
			}
		  }
	}
	  }
	});
};

exports.handleFileDownload = (url) => {
	return new Promise(async (resolve, reject) => {
	  const UTCDate = new Date();
	  const year = UTCDate.getUTCFullYear();
	  const month = UTCDate.getUTCMonth();
	  const day = UTCDate.getUTCDate();
	  const hour = UTCDate.getUTCHours();
	  let options = { width: 500, height: 500, jpegOptions: { force:true, quality:100 } }
	  let destination = "resources/attachments";
	  let thumbnailDestination = "resources/attachments/thumbnail"
	  let makeDir = await makeDirectory(destination);
	  let thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + year;
	  thumbnailDestination = thumbnailDestination + "/" + year;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + month;
	  thumbnailDestination = thumbnailDestination + "/" + month;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + day;
	  thumbnailDestination = thumbnailDestination + "/" + day;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  destination = destination + "/" + hour;
	  thumbnailDestination = thumbnailDestination + "/" + hour;
	  makeDir = await makeDirectory(destination);
	  thumbDir = await makeDirectory(thumbnailDestination);
	  if (makeDir && thumbDir) {
		console.log('sssssssssssssssssssd',file)
	  }
	});
};

exports.getDefaultLanguage = async() =>{
	try{
		let data = await Models.languages.findOne({
			attributes: ['id','code'],
			where : {
				default : 1
			}
		})

		return data;
	}catch(e){
		return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
	}
}

exports.getLanguage = async(languageCode)=>{
	try{
		let data = await Models.languages.findOne({
			attributes: ['id', 'code'],
			where : {
				code : languageCode
			}
		})
		return data;
	}catch(e){
		return e;
	}
}

exports.updateAttachmentUsage = async(attachmentId) =>{
	try{
		let data = await Models.attachments.update({
			usageFlag : 1,    
		}, {
			where : {
				id : attachmentId
			}
		})
		return data;
	}catch(e){
		return e;
	}
}

exports.updateAttachmentUsageMulti = async(attachmentId) =>{
	try{
		let data = await Models.attachments.update({
			usageFlag : 1
		},{
			where : {
				id: {
					[Op.in]: attachmentIds
				}
			}
		})
	}catch(e){
		return e;
	}
}

exports.getAttachment = async(attachmentIds) =>{
	try{
		let data = await Models.attachments.findAll({
			attributes : ['id','filePath', 'thumbnailPath']
		}, 
		{
			where : {
				id: {
					[Op.in]: attachmentIds
				}
			}
		})
		return data;
	}catch(e){
		return e;
	}
}



 /* 
 exports.sendNotification = async(notificationData, token)=>{
		console.log('--NOTIFICATIONDATA-?', notificationData,)
		if (token) {
			var message = {
				to: token,
				data: {
					type: notificationData.type,
					title: notificationData.title,
					message: notificationData.message,
				 	orderId: notificationData.orderId,
					tag: notificationData.tag || null,
					inboxCount: token[0].inboxCount   
				}
			};
			 if (notificationData.type == constant.NOTIFICATION_TYPE.EXPERIENCE_CHAT_MESSAGE.type) {
				message.data.chatEncryptionKey = notificationData.chatEncryptionKey,
				message.data.chatId = notificationData.chatId,
				message.data.experienceName = notificationData.experienceName,
				message.data.receiverName = notificationData.receiverName
			}
			if (notificationData.type == constant.NOTIFICATION_TYPE.ORDER_READY_DRIVER.type) {
				message.data.pickupId = notificationData.pickupId
			}
			if (notificationData.type == constant.NOTIFICATION_TYPE.ZENDESK.type) {
				message.data.ticket_id = notificationData.ticket_id
			}
			if (token[0].device_type == constant.DEVICE_TYPE.IOS) {
				message.notification = {
					body: notificationData.message,
					title: notificationData.title,
	
				}
				if (token[0].type == constant.ROLE.MERCHANT) {
					message.notification.sound = "notification.mp3"
				} else {
					message.notification.sound = "default.mp3"
				}
				if (notificationData.type == constant.NOTIFICATION_TYPE.NEW_ORDER.type) {
					message.notification.sound = "new_order_notification.mp3"
				}
			}
			if (notificationData.image && notificationData.image.thumbnail) {
				message.data.imageUrl = notificationData.image.thumbnail
			}
			if (notificationData.messageId) {
				message.data.messageId = notificationData.messageId
			}   
			console.log('mmmm',message)
			fcm.send(message, function (err, response) {
				console.log('err--', err);
				
				return true
	
			})
		}
}  

 */