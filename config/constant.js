module.exports = {
	key: {
		privateKey: "ZYH8njecb9FzPkPbbGqRYM5B3LGTPMSX",
		tokenExpiry: 1 * 1000 * 60 * 60 // 1 hour
	},
	algorithm: "aes256",
	iv : "keykeykeykeykeyk",
	STATUS: {
		ACTIVE: 1,
		INACTIVE: 2,
		BLOCK:3
	},
	VERIFY_STATUS : {
		VERIFIED : 1,
		UNVERIFIED : 0
	},
	BLOG_STATUS:{
		UNPUBLISH:0,
		PUBLISH:1,
		DRAFT:2
	},
	VERIFICATION_STATUS: {
		VERIFIED: 1,
		UNVERIFIED: 2
	},
	PROFILE_STATUS: {
		COMPLETED: 1,
		INCOMPLETE: 2
	},
	VERIFICATION_ENTITY_TYPES: {
		MOBILE: "mobile",
		EMAIL: "email"
	},
	USAGE_FLAG: {
		UNUSED: 0,
		USED: 1
	},
	EMAIL_TEMPLATES_TYPES : {
		EMAIL : 1,
		NOTIFICATION : 2
	},
	ROLES : {
		ADMIN_ROLE : 1,
		USER_ROLE : 2,
		VENDOR_ROLE:3
	},
	ATTACHMENT_USAGE_STATUS: {
		UNUSED : 0,
		USED: 1
	},
	PAGINATION_LIMIT : {
		LIMIT : 20
	},
	NOTIFICATION_TO:{
		ADMIN:0,
		USER:1,
		VENDOR:2	     
	},
	ADMIN_NOTIFICATION_TYPE:{
		VENDOR_CREATED:
		{
			type:0,
			title:"New Vendor Created",
			body:"",

		},
		USER_CREATED:{
			type:1,
			title:"New User Created",
			body:"",
		},
		NEW_ORDER:{
			type:2,
			title:"New Order",
			body: "New Order {type} received",
		},
		NEW_BUSINESS_REQUEST:{
			type:3,
			title:'New business request.',
			body:'Received a new business {name} request.'
		}

	},

	VENDOR_NOTIFICATION_TYPE:{
		VENDOR_BUSINESS_BOOKING_CONFIRMED:
		{
			type:0,
			title:"{} Booking",
			body:"You have a new booking",

		},
		VENDOR_RESTAURANT_ORDER:{
			type:1,
			title:"You have a new order",
			body:"New order received just check it out!",
		},

		VENDOR_SUBSCRIPTION_PLAN:{
			type:2,
			title:"Payment Successfull",
			body: "Your subscription plan has been activated",
		},

		VENDOR_RECEIVE_RESERVATION:{
			type:3,
			title:'You have new reservation',
			body:'New reservation received just check it out!'
		},
		VENDOR_ADMIN_APPROVED_BUSINESS:{
			type:4,
			title:'Business Approved',
			body:'Your Business {Name} is approved by the Admin'
		},
		VENDOR_BUSINESS_RATING:{
			type:5,
			title:'Business Rating',
			body:'You have received a Rating and Review'
		}
	},

	NOTIFICATION_TYPE:{
		BOOKING_CONFIRMED:
		{
			type:0,
			title:"{} Booking Successful",
			body:"Your booking is successful",

		},
		BOOKING_CANCELLED:
		{
			type:1,
			title:"{} Booking Failed",
			body:"Your booking is failed",
		},
		BOOKING_REFUND:
			{
				type:2,
				title:"Booking cancelled successfully",
                body:"Your refund has been initiated succeesfully it will be reflected in your account 2-7 days",
			},

		ORDER_SUCCESSFULL:
			{
				type:3,
				title:"Order Successful",
				body:"Your order is successful",
			},

			ORDER_REFUND:{
				type:4,
				title:"Order cancelled successfully",
                body:"Your refund has been initiated succeesfully it will be reflected in your account 2-7 days",
			},

			VENDOR_CANCELLED_ORDER:{
				type:5,
				title:"You Order has Been cancelled By the {}",
				body:"Order has cancelled by the restaurant and your refund has been initiated succeesfully it will be reflected in your account 2-7 days"
			},
			VENDOR_ACCEPTED_ORDER:{
				type:6,
				title:"You order has been accepted by the {}",
				body:"Order has accepted by the restaurant"
			},
			VENDOR_CANCELLED_BOOKING:{
				type:7,
				title:"{} Booking Cancelled",
				body:"Your booking request has been cancelled "
			},
			VENDOR_ACCEPTED_BOOKING:{
				type:8,
				title:"{} Booking Confirmed",
				body:"Your booking request has been confirmed "
			},

			VENDOR_DELIVERED_ORDER:{
				type:9,
				title:"Order Delivered Successfully",
				body:"Your order has been delivered successfully" 

			},

			VENDOR_CREATED_NEW_EVENT:{
				type:10,
				title:"{} has created the new event ",
				body:"Click here to check"
			}

	},

	BUSINESS_STATUS:{
		PENDING:0,
		ACCEPT:1,
		REJECT:2,
		DELETE:3
	},

	RATING_STATUS:{
		HIDE:0,
		SHOW:1,
		DELETE:3,
	},

	CLAIM_BUSINESS:{
		PENDING:0,
		ACCEPT:1,
		REJECT:2
	},

	EMAIL_FROM:{
		FROM:'info@enjoyinglyfe.com'
	}

	
};
