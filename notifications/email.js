const nodemailer = require("nodemailer");

const options = {
	host: "email-smtp.us-east-1.amazonaws.com",
	port: "587",
	secure: false, // true for 465, false for other ports
	auth: {
		user: "AKIAXS2JXNKAD2E25D5G",
		pass: "BLYVqvKQkZaH6qmk6/dxvC3/ItWW6zul3UEkdS4VpXd6"
	},
	tls:true
};

const smtpTransport = nodemailer.createTransport(options);

/**
 * Send an email
 * @param {String} from From
 * @param {String} to To
 * @param {String} subject Subject
 * @param {String} html HTML template
 * @return {Promise}
 */
function sendEmail (from, to, subject, html) {
	const options = {
		from,
		to,
		subject,
		html
	};

	 return new Promise((resolve, reject) => {
		smtpTransport.sendMail(options, (error, result) => {
			if (error) reject(error);
			
			else { console.log("Message sent: %s", result.messageId); }
			resolve(result);
		}); 
	});  
}

module.exports = {
	sendEmail
};
