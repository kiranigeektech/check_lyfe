/* const jwt = require('jsonwebtoken')
let possibleDaysArray = [{
    days : 0,
    startTime : null,
    endTime : null
},
{
    days : 1,
    startTime : null,
    endTime : null
},
{
    days : 2,
    startTime : null,
    endTime : null
},
{
    days : 3,
    startTime : null,
    endTime : null
},
{
    days : 4,
    startTime : null,
    endTime : null
},
{
    days : 5,
    startTime : null,
    endTime : null
},
{
    days : 6,
    startTime : null,
    endTime : null
}
]

let data =[
    {
        days : 2,
        startTime : "434",
        endTime : "43534"
    },
    {
        days : 3,
        startTime : "423",
        endTime : "423"
    },
    {
        days : 5,
        startTime : "423665",
        endTime : "423575"
    }
]

let daysToSend = []
for(let eachDay of possibleDaysArray){
    let flag = 0
    for(let eachdata of data){
        if(eachDay.days == eachdata.days){
            daysToSend.push(eachdata)
            flag = 1;
            break;
        }
    }

    if(flag == 0){
        daysToSend.push(eachDay)
    }
}


var decrypt = jwt.decrypt('cbcae6272c5671f920e9a157a12c3b59')
console.log("days", decrypt) */

// let obj = { '131': [ 27, 28 ], '132': [ 27 ] }

// for(const [key, value] of Object.entries(obj)){
//     console.log(key,value)
// }

const email = require("./templates/bookingConfirmReceipt");

let notification={
    type:'ddddddd',
    title:'mmmmmmmmmm',
    message:'GGGSVJV'
}
var token ="eA4fyIr4QeWgZnzEs0yypM:APA91bHAUXAxO5l7Bg1XlXAsFjZ0cDF99QOfKXFnKkLCoED0ZoRloLRKnQE6zvAwZr-PZuILMsR-N-3qnPQhY2puoP5Ahqw8iAArxHwnrZgvOKtmzcrDGU64a-DDmdlruGqJzdC_Qr6O"
var a=2
data=async()=>
{
 /*    let data = await email.sendEmail('rockingar17@gmail.com','syed@illuminz.com','order confirmed','hello')
    console.log('SSSSSSSS',data) */

 
}

data()
 