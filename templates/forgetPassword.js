let email = `
<tr>
<td class="p-left p-right" style="padding-top:30px;padding:48px 72px 40px 72px;border-left:1px solid #F3F4F4;border-right:1px solid #F3F4F4;">
            
<p style="font-family: 'Inter', sans-serif;font-weight:400;font-size:18px;line-height:30px;letter-spacing:.1px;color:#495377;margin:0 0 32px;">Hi, <br/>
  We’ve received a request to reset your password for your Lyfe account.</p>
    <div style="text-align:center;">
      <h4 style="font-size: 20px;">Your OTP is <span style="color: #100637;font-size: 25px;">{{otp}} </span> for reset password</h4>
    </div>

     <p style="font-family: 'Inter', sans-serif;font-weight:400;font-size:18px;line-height:30px;letter-spacing:.1px;color:#495377;margin:0 0 32px;">If you didn’t request a password change, you can simply ignore this message.</p>

     <p style="font-family: 'Inter', sans-serif;font-weight:400;font-size:18px;line-height:30px;letter-spacing:.1px;color:#495377;margin:0 0 32px;">Thank You,<br/>
      Team Lyfe</p>

</td>
</tr>`

module.exports = {
    forgetPassword:email,
  };
  