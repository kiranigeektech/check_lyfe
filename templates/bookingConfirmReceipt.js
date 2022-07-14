let booking = `
            <tr>
            <td class="p-left p-right" style="padding-top:30px;padding:48px 72px 40px 72px;border-left:1px solid #F3F4F4;border-right:1px solid #F3F4F4;">
            
            <p style="font-family: 'Inter', sans-serif;font-weight:500;font-size:20px;line-height:1;letter-spacing:.1px;color:#00b309;margin:0 0 15px;text-align: center;">Your booking is confirmed.</p>
            <p style="font-family: 'Inter', sans-serif;font-weight:400;font-size:18px;line-height:1;letter-spacing:.1px;color:#495377;margin:0 0 32px;text-align: center;">Your booking id is : <b>#{{id}}</b></p>
            {{#each booking}}
            <div style="padding:25px 20px;background-color: rgb(246, 244, 247);">
              <h4 style="margin:0 0 0;font-size:20px;font-weight: 500;">{{name}}</h4>
              <p style="font-size: 16px;font-weight: 500;padding: 0px;color: rgb(56, 57, 59);letter-spacing:-.1px;margin: 12px 0 0;">
                <span style="width:120px;display:inline-block;">Location: </span>{{address}}
              </p>
              
              <p style="font-size: 14px;font-weight: 500;padding: 0px;color: rgb(56, 57, 59);letter-spacing:-.1px;margin: 5px 0 0;">
                <span style="width:120px;display:inline-block;">Show Timings: </span>{{this.startTime}}-{{this.endTime}} | {{this.startDate}} </p>
            
            </div>
            {{/each}}
            
            {{#each booking}}
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom: 0px;border:1px solid rgb(243, 240, 245);padding-bottom: 20px;">
              <tr>
                <td style="font-size: 16px;font-weight: 600;padding: 15px 20px;color: rgb(56, 57, 59);letter-spacing:-.1px;">
                  Ticket Amount
                  {{#each ticket}}
                  <p style="margin: 5px 0 0;font-size: 14px;font-weight: 400;">{{this.ticketName}}</p>
                  {{/each}}
              </td>
                <td style="font-size: 16px;font-weight: 600;padding: 15px 20px;text-align: right;color: rgb(56, 57, 59);letter-spacing:-.1px;">$ {{this.totalTicketPrice}}
                {{#each ticket}}
                <p style="margin: 5px 0 0;font-size: 14px;font-weight: 400;">{{this.ticketSold}} x $ {{this.price}}</p>
                {{/each}}
                </td>
              </tr>
              <tr><td style="border-top: 1px solid rgb(243, 240, 245) ;" colspan="2"></td></tr>

            </table>
            {{/each}}

            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom: 0px;background-color: rgb(246, 244, 247);">
              <tr>
                <td style="font-size: 20px;font-weight: 500;padding: 15px 20px;color: rgb(99, 99, 99);">Amount paid</td>
                <td style="font-size: 20px;font-weight: 600;padding: 15px 20px;text-align: right;color: rgb(56, 57, 59);letter-spacing:-.1px;">$ {{totalAmount}}</td>
              </tr>
            </table>
            
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom: 30px;background-color: rgb(255, 255, 255);">
              <tr>
                <td style="padding: 20px 0 ;">
                  <p style="font-size: 14px;line-height: 1;margin: 0 0 12px;color: rgb(99, 99, 99); ">Booking date:</p>
                  <p style="font-size: 16px;line-height: 1;margin: 0 0 0;font-weight: 500;">{{createdAt}}</p>
                </td>

                <td style="padding: 20px 20px ;text-align: right;">
                  <p style="font-size: 14px;line-height: 1;margin: 0 0 12px;color: rgb(99, 99, 99); ">Payment type:</p>
                  <p style="font-size: 16px;line-height: 1;margin: 0 0 0;font-weight: 500;">{{paymentMethod}}</p>
                </td>

                <!-- <td style="padding: 20px 0 ;">
                  <p style="font-size: 14px;line-height: 1;margin: 0 0 12px;color: rgb(99, 99, 99); ">Confirmation:</p>
                  <p style="font-size: 16px;line-height: 1;margin: 0 0 0;font-weight: 500;">20209308</p>
                </td> -->
              </tr>
            </table>
            
            <p style="font-family: 'Inter', sans-serif;font-weight:400;font-size:18px;line-height:30px;letter-spacing:.1px;color:#495377;margin:0 0 50px;"></p>
          </td>
            </tr>
         `

module.exports = {
    bookingConfirmReceipt: booking,
  };
  