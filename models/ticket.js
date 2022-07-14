const db = require(".");
const {Model, Sequelize} = require('sequelize');


module.exports=(sequelize,DataTypes)=>{
    class ticket extends Model{
        static associate(models){
            /* ticket.hasMany(models.ticketName,{foreignKey:"ticket_id"}) */ 
            ticket.hasMany(models.booking,{foreignKey:"ticket_id"})
        }
    }
    ticket.init({
        event_id:{
            type:DataTypes.INTEGER
        },
        ticketName:{
            type:DataTypes.STRING
        },
        description:{
            type:DataTypes.STRING
        },
        noOfTicketAvailable:{
            type:DataTypes.INTEGER
        },
        originalPrice:{
            type:DataTypes.INTEGER
        },
        price:{
            type:DataTypes.INTEGER
        },
        noOfTicketRemain:{
            type:DataTypes.INTEGER
        },
        minLimit:{
            type:DataTypes.INTEGER
        },
        maxLimit:{
            type:DataTypes.INTEGER
        },
        isDeleted : {
			type: DataTypes.INTEGER,
			defaultValue : 0
		}
    },{sequelize:sequelize,modelName:'ticket'})
    return ticket
}