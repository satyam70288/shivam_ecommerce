function welcomeEmailTemplate(customerName, websiteLink, supportInfo) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Welcome to Shree Laxmi Shop</title>
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        margin: 0;
        background: #e8dfcc;
        color: #2d2d2d;
        width: 100%;
      }
      .header {
        text-align: center;
        background: #f2eee6;
        padding: 10px 20px;
      }
      .logo {
        text-align: left;
      }
      .header img {
        width: 100px;
        padding: 0px 60px;
      }
      .header h1 {
        font-size: 28px;
        margin: 10px 0;
      }
      .header h2 {
        font-size: 36px;
        color: red;
        margin: 10px 0;
        font-weight: 800;
      }
      .header p {
        font-size: 18px;
        margin: 0;
        font-variant: small-caps;
      }
      .shop-button {
        margin-top: 20px;
        display: inline-block;
        background: white;
        border: 3px solid #000;
        padding: 15px 30px;
        font-size: 22px;
        font-weight: bold;
        color: red;
        text-decoration: none;
        border-radius: 10px;
        box-shadow: 5px 5px 0 #333;
      }
      .content {
        padding: 40px 20px;
        text-align: center;
        font-size: 18px;
        line-height: 1.8;
        color: #2d2d2d;
      }
      .content strong {
        font-weight: bold;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #444;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">
        <!-- Optional Logo Placeholder -->
      </div> 
      <img src="https://yourdomain.com/logo.png" alt="Shree Laxmi Shop Logo" />
      <h1>Welcome to</h1>
      <h2>SHREE LAXMI SHOP</h2>
      <p>Let’s Get Started!</p>
      <a href="${websiteLink}" class="shop-button">SHOP NOW</a>
    </div>

    <div class="content">
      <p>Hi <strong>${customerName}</strong>,<br>
        Thank you for signing in and setting up your account,<br>
        We’re excited to have you with us!</p>

      <p>Explore toys, gifts, stationery, cosmetics, imitation jewellery, pooja samagri, bags, and daily-use items — all in one place.</p>

      <p>Your journey with <strong>Shree Laxmi Shop</strong> starts now.<br>
        If you ever need help, reach us at <strong>${supportInfo}</strong>.<br>
        We’re here to make sure everything goes smoothly.</p>

      <p>Welcome aboard,<br>
        The <strong>Shree Laxmi Shop</strong> Team</p>

      
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  welcomeEmailTemplate,
};
