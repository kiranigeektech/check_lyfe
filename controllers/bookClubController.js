const db = require("../models/index");
const moment = require('moment');
class Club{

    // Book Club
    bookClub = async(request) => {
        try {
            // var totalAmount = []
            // for(var i=0 ;i<request.payload.ticketCategories.length ; i++){
            //     const ticket = request.payload.ticketCategories[i].ticketCategoryItems;
            //     const amount = parseInt(ticket.noOfPerson) * parseInt(ticket.price);
            //     totalAmount.push({
            //         categoryName : request.payload.ticketCategories[i].categoryName , 
            //         noOfTicket : ticket.noOfPerson,
            //         costOfTicket : ticket.price,
            //         totalAmount : amount 
            //     })
            // }
            const ticket = await db.ticketCategoryItem.findOne({
                where : {
                    id : request.payload.ticketType
                }
            });
            const newDate = new Date();
            const formatDate = moment(newDate).format("MM-DD-YYYY");
            const startTime = moment(`${formatDate} ${request.payload.startTime}`).format('HH:mm:ss')
            const endTime = moment(`${formatDate} ${request.payload.endTime}`).format('HH:mm:ss');
            const result = await db.bookClub.create({
                bookClubId : request.payload.bookClubId,
                noOfPerson : request.payload.noOfPerson,
                startDate : request.payload.startDate,
                endDate : request.payload.endDate,
                startTime : startTime,
                endTime : endTime,
                ticketType : request.payload.ticketType,
                quantity : request.payload.quantity,
                priceOfOne : ticket.dataValues.price,
                totalPrice : parseInt(ticket.dataValues.price) * parseInt(request.payload.quantity)
                // totalAmount : totalAmount,
                // ticketCategories : request.payload.ticketCategories,
                // ticketCategoryItems : request.payload.ticketCategoryItems
            },
            // {
            //     include : [
            //         {
            //             model : db.ticketCategory,
            //             include : [
            //                 {
            //                     model : db.ticketCategoryItem
            //                 }
            //             ]
            //         }
            //     ]
            // }
            )
            return {data : result,message : 'booking confirmed'};
        }
        catch(e){
            console.log('______err',e);
            // if(e.original.errno === 1452){
            //     return 'id doesnot exist'
            // }
            return e;
        }
    }

    getBookingDetails = async(request) => {
        try {
            const result = await db.bookClub.findAll({})
            return result;
        }
        catch(e){
            console.log('______err',e);
            return e;
        }
    }

    // Ticket Category
    addTicketCategory = async(request) => {
        try {
            const result = await db.ticketCategory.create({
                categoryName : request.payload.categoryName,
                categoryId : request.payload.categoryId
            })
            return result;
        }
        catch(e){
            console.log('______err',e);
            return e;
        }
    }

    getTicketCategory = async(request) => {
        try {
            const result = await db.ticketCategory.findAll({
                include : [
                    {
                        model : db.ticketCategoryItem
                    }
                ]
            })
            return result;
        }
        catch(e){
            console.log('______err',e);
            return e;
        }
    }

    // Ticket category Item
    addTicketCategoryItem = async(request) => {
        try {
            const result = await db.ticketCategoryItem.create({
                price : request.payload.price,
                itemId : request.payload.itemId,
                noOfPerson : request.payload.noOfPerson
            })
            return result;
        }
        catch(e){
            console.log('______err',e);
            return e;
        }
    }

    getTicketCategoryItem = async(request) => {
        try {
            const result = await db.ticketCategoryItem.findAll({})
            return result;
        }
        catch(e){
            console.log('______err',e);
            return e;
        }
    }


    // Final club book
    bookFinalClub = async(request) => {
        try {
            const ticket = await db.ticketCategoryItem.findOne({
                where : {
                    id : request.payload.ticketType
                }
            });
            if(ticket){
                var result = await db.bookingTickets.create({
                    orderId : request.payload.orderId,
                    ticketType : request.payload.ticketType,
                    quantity : request.payload.quantity,
                    priceOfOne : ticket.dataValues.price,
                    totalPrice : parseInt(ticket.dataValues.price) * parseInt(request.payload.quantity)
                })
            }
            return {
                data : result,message : 'booking confirmed'
            };
        }
        catch(e){
            console.log('______err',e);
            if(e.original.errno === 1452){
                return 'id doesnot exist'
            }
            return e;
        }
    }

    getFinalBookingDetails = async(request) => {
        try {
            const result = await db.bookingTickets.findOne({
                where : {
                    id : request.query.bookingId
                }
            });
            const order = await db.bookClub.findOne({
                where : {
                    id : result.orderId
                }
            })
            const ticketType = await db.ticketCategory.findOne({
                where : {
                    id : result.ticketType
                }
            });
            const categoryItem = await db.ticketCategoryItem.findOne({
                where : {
                    id : ticketType.categoryId
                }
            })
            const clubDetails = await db.clubs.findOne({
                where : {
                    id : order.bookClubId
                }
            })
            return {
                    result:{
                        id:result.id, 
                        bookedOrder:{
                            id : order.id,
                            noOfPerson : order.noOfPerson,
                            startDate : order.startDate,
                            endDate : order.endDate,
                            startTime : order.startTime,
                            endTime : order.endTime,
                            clubDetail : clubDetails
                        }, 
                        ticket : {
                            id : ticketType.id,
                            categoryName : ticketType.categoryName,
                            categoryItem : categoryItem
                        }
                    }
                }
        }
        catch(e){
            console.log('______err',e);
            return e;
        }
    }

}

module.exports = new Club()