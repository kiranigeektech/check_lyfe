let email = `
            <tr>
               <td class="p-left p-right" style="padding-top:30px;padding-right:40px;padding-bottom:7px;padding-left:40px;border-left:1px solid #F3F4F4;border-right:1px solid #F3F4F4;">
                  <h3 style="margin:0;color:color: #03060B;;font-family:'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:24px;line-height:28px;padding-bottom:0px;letter-spacing: 0.24px;">Hi {{name}}</h3>
                  <p style="color: #323A49;font-family:'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size:20px;line-height:32px;margin:0;font-weight: 500;">
                     Welcome to Lyfe
                  </p>
                  <p style="color: #323A49;font-family:'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';font-size: 14px;letter-spacing: 0.12px;line-height: 22px; margin:0; padding-top: 20px; padding-bottom: 32px;">
                     Thanks for using Lyfe! <br/>
                     Your order has been confirmed and will be delivered shortly.
                  </p>
               </td>
            </tr>
            <tr>
               <td class="p-left p-right" style="padding: 0 40px;border-left:1px solid #F3F4F4;border-right:1px solid #F3F4F4;">
                  <table style="width: 100%; table-layout: fixed;">
                     <tr>
                        <td>
                           <label style="display: block; color: #323A49;font-size: 14px;letter-spacing: 0.12px;line-height: 16px;">Order No.</label>
                           <p style=" padding-top: 6px; color: #0B0E13;font-size: 16px;font-weight: 500;letter-spacing: 0.14px;line-height: 19px; margin: 0;">{{orderNo}}</p>
                        </td>
                        <td>
                           <label  style="display: block; color: #323A49;font-size: 14px;letter-spacing: 0.12px;line-height: 16px;">Restaurant</label>
                           <p style="padding-top: 6px; color: #0B0E13;font-size: 16px;font-weight: 500;letter-spacing: 0.14px;line-height: 19px; margin: 0;">{{restaurant}}</p>
                        </td>
                     </tr>
                  </table>
               </td>
            </tr>
            <tr>
               <td height="32" style="border-left:1px solid #F3F4F4;border-right:1px solid #F3F4F4;"></td>
            </tr>
            <tr>
               <td class="p-left p-right" style="padding: 0 40px; border-left:1px solid #F3F4F4;border-right:1px solid #F3F4F4;">
                  <table style="width: 100%; border-collapse:collapse;">
                     <thead style="background-color: #F2F3F5; border-collapse=collapse" >
                        <tr>
                           <th  style="background-color: #F2F3F5;color: #323A49;font-size: 12px;font-weight: 500;letter-spacing: 0.86px;line-height: 16px; padding: 8px 8px; text-align: left;">Item</th>
                           <th style="background-color: #F2F3F5;color: #323A49;font-size: 12px;font-weight: 500;letter-spacing: 0.86px;line-height: 16px;padding: 8px 8px; text-align: center;">Quantity</th>
                           <th style="background-color: #F2F3F5;color: #323A49;font-size: 12px;font-weight: 500;letter-spacing: 0.86px;line-height: 16px;padding: 8px 8px; text-align: right;">Price per unit</th>
                           <th style="background-color: #F2F3F5;color: #323A49;font-size: 12px;font-weight: 500;letter-spacing: 0.86px;line-height: 16px;padding: 8px 8px; text-align: right;">Total Item Price</th>
                           </tr>
                     </thead>
                     <tbody>
                     {{#each items}}
                        <tr>
                           <td style="color: #0B0E13;font-size: 14px;font-weight: 500;line-height: 16px; padding: 8px 4px; text-align: left;">{{this.name}}</td>
                           <td style="color: #0B0E13;font-size: 14px;font-weight: 500;line-height: 16px;padding: 8px 4px; text-align: center;">{{this.quantity}}</td>
                           <td style="color: #0B0E13;font-size: 14px;font-weight: 500;line-height: 16px;padding: 8px 4px; text-align: right;">{{this.currency}}{{this.price}}</td>
                           <td style="color: #0B0E13;font-size: 14px;font-weight: 500;line-height: 16px;padding: 8px 4px; text-align: right;">{{this.currency}}{{this.totalprice}}</td>
                           </tr>
                        {{/each}}
                        <tr>
                           <td  colspan="4" style="border-bottom: 1px solid #F2F3F5; padding-top: 15px;"></td>
                        </tr>
                        <tr>
                           <td  colspan="4" style="height:15px;"></td>
                        </tr>
                     </tbody>
                     <tfoot style="">
                        <tr>
                           <td colspan="3" style="padding: 8px 4px; color: #0B0E13;font-size: 14px;line-height: 16px;text-align: right;">Cart Subtotal</td>
                           <td style="padding: 8px 4px; color: #0B0E13;font-size: 14px;font-weight: 500;line-height: 16px;text-align: right;">{{currency}}{{cartSubtotal}}</td>
                        </tr>
                     {{/if}}
                  
                     {{#if taxes}}
                        <tr>
                           <td  colspan="3" style="padding: 8px 4px; color: #0B0E13;font-size: 14px;line-height: 16px;text-align: right;">Taxes</td>
                           <td style="padding: 8px 4px; color: #0B0E13;font-size: 14px;font-weight: 500;line-height: 16px;text-align: right;">{{currency}}{{taxes}}</td>
                        </tr>
                     {{/if}}

                        <tr>
                          <td colspan="4" style="text-align:right;">
                            <p style="color: #1B8143; font-size: 14px;font-weight: 500; display: inline-block; text-align: left; width: 257px; background-color: #E0FAEA;border-radius: 8px; height: 48px; line-height: 48px; padding:0 12px">Grand Total <span style="color: #1B8143;font-size: 20px;font-weight: 500;line-height: 24px; float: right; padding-top: 10px;">{{currency}}{{total}}</span></p>
                          </td>
                        </tr>

                     </tfoot>
                  </table>
              </td>
            </tr>
         `

module.exports = {
    orderConformReceipt: email,
  };
  