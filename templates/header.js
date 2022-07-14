let emailHeader =`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
    
  <style type="text/css">
		body{
			font-family:'Inter',sans-serif;
		}
	@media screen and (max-width:475px){
		.p-left{
			padding-left:15px !important;
		}

}	@media screen and (max-width:475px){
		.p-right{
			padding-right:15px !important;
		}

}	@media screen and (max-width:475px){
		.banner-text{
			width:100%;
			margin-bottom:20px;
			padding-right:30px;
		}

}	@media screen and (max-width:475px){
		.radius0{
			border-radius:0 !important;
		}

}	@media screen and (max-width:475px){
		.padding0{
			padding-top:0 !important;
		}

}</style></head>
  <body class="padding0" style="margin:0px;background-color:#F3F6F9;padding-top:15px;padding-bottom:15px;">
    <table style="max-width:800px;width:100%;background:transparent;border-radius:12px;" cellpadding="0" cellspacing="0" align="center">
      
      <tbody style="text-align:left;background:#fff;">
        <!--tr&gt;
        <td class="p-left p-right radius0" style="text-align:center;padding-top:24px;padding-right:30px;padding-bottom:22px;padding-left:30px;background-color:#fff;border-radius:12px 12px 0 0;">
          <img width="100" src="https://mcusercontent.com/b967d871c939e76ecbaddd30d/images/31bdc6e3-9b1d-4c24-be1c-c32d35886e28.png" style="width:100px;vertical-align: middle;margin-top:20px;" alt="">
        </td>
        &lt;/tr-->
        <tr>
          <td style="background:#613FE9;    border-radius:12px 12px 0px 0px;">
            <table cellpadding="0" cellspacing="0" style="width:100%;">
              <tbody>
                <tr>
                  <td style="padding:48px 20px 40px 40px;">
                    <div class="banner-text" style="text-align:center;">
                      <div><img width="158" style="margin: 0 0 28px;" src="https://mcusercontent.com/b967d871c939e76ecbaddd30d/images/fdff3b2f-9cfd-81d6-f259-850e3648ac68.png" alt="a0ec9dac-4511-41f2-b6aa-fd730e62cb45.png">
                      </div>
                      <h2 style="margin:0 0 0px;font-family: 'Inter', sans-serif;font-weight:300;font-size:30px;line-height:1.2;letter-spacing:-1px;color:#FFFFFF;">{{type}}</h2>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        {{{content}}}
      </tbody>

      <tfoot style="text-align:center;width:100%;">
        <tr>
          <td class="radius0" style="background-color:#100637;border-radius:0 0 12px 12px;padding:40px 0 35px;">
            <table style="width:100%;">
              <tr>
                <td>
                  <img width="158" style="margin-bottom: 20px;" src="https://mcusercontent.com/b967d871c939e76ecbaddd30d/images/fdff3b2f-9cfd-81d6-f259-850e3648ac68.png" alt="">
                </td>
              </tr>
              <tr>
                <td style="height:18px;"></td>
              </tr>
              <tr>
                <td style="padding-bottom:0px;">
                  <ul style="padding:0;list-style:none;display:inline-block;margin:0;">
                    <li style="display:inline-block;padding-right:15px;margin:0;">
                      <a href="https://www.facebook.com/The-LYFE-App-107272354852787" style="width:24px;height:24px;display:inline-block;line-height:24px;border-radius:2px;"><img src="https://mcusercontent.com/b967d871c939e76ecbaddd30d/images/24cb774d-31e9-476e-a457-b22b44a8ac94.png" alt="" style="padding-top: 5px; max-width:100%"></a>
                    </li>
                    <li style="display:inline-block;padding-right:15px;margin:0;">
                      <a href="https://www.instagram.com/thelyfeapp" style="width:24px;height:24px;display:inline-block;line-height:24px;border-radius:2px;"><img src="https://mcusercontent.com/b967d871c939e76ecbaddd30d/images/c9e96864-5b21-4abe-9c2b-241c22fb8d64.png" alt="" style="padding-top: 5px; max-width:100%"></a>
                    </li>
                    
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="font-size:16px;line-height:30px;text-align:center;color:#495377;margin:15px 0 10px;">©2021.LYFE. All rights reserved</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- <tr>
        <td>
          
  
        </td>
      </tr> -->
      </tfoot>
    </table>
  </body>
</html>`

module.exports ={
  header:emailHeader
}