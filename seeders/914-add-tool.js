"use strict";

/** @type {import('sequelize-cli').Migration} */
const { faker } = require("@faker-js/faker");

module.exports = {
  async up(queryInterface, Sequelize) {
    const tools = [];
    const overviews = [
      `
    <p><span style="font-size: 18px;">We've all seen the familiar bottle of water in every store. That water bottle satisfied our thirst while we were drenched in sweat in the midst of the day. The water bottle has a name. Bisleri.</span></p><p><span style="font-size: 24px;"><strong>Buzz:</strong></span></p><p><span style="font-size: 18px;">Tata wants to acquire Bisleri. This will give Tata a foot in India's 110 Billion dollar FMCG Market. </span></p><p><span style="font-size: 18px;">But the deal is still on-off because Tata is haggling, offering less price than what Bisleri asked for. </span></p><p><span style="font-size: 18px;">India is the 12th largest consumer of bottled water by value and the industry grew by 27% in 3 years. But the scale of bottled water penetration in India is still 88.57% less than the USA.&nbsp;</span></p><p><span style="font-size: 18px;">Buy an existing brand &amp; Enter a market if you have capital has been</span> <span style="font-size: 18px;">Reliance's mantra in the recent past.</span></p><p><span style="font-size: 18px;">Taking a leaf from Reliance's roadshow, Tata wants to acquire Bisleri, a name that is synonymous to mineral water in the Desi household parlance and holds 32% market share in the bottled water industry. </span></p><p><span style="font-size: 18px;">Around 60% of the bottled water market is dominated by unorganized brands. Even though Tata's own bottled water company Tata Copper made a revenue of 400+ Crores this year, acquiring Bisleri would give Tata an edge in the mineral water market. </span></p><p><span style="font-size: 18px;">Tata and Bisleri are the only two major brands in India that are made in India. The other two major players Kinley and Acquafina are owned by Kinley and Pepsico. </span></p><p><span style="font-size: 18px;">If Tata drops the deal, what does Tata stand to lose? Can Tata compete with Bisleri? Only time will tell.</span></p><p><span style="font-size: 18px;">&nbsp;Meanwhile, Bisleri is also on the cusp of a leadership change where the current owner's daughter Jayanti Chauhan is stepping forward to take ownership of the company. </span></p><p><span style="font-size: 18px;">We elaborate on the legacy of Bisleri below.</span></p><p><span style="font-size: 24px;"><strong>Bisleri - A Legacy:</strong></span></p><h2><span style="font-size: 18px;">Bisleri - Many individuals are unaware of the history of this life-changing investment. Let us investigate it and learn about its history.&nbsp;</span></h2>
    <h2><span style="font-size: 18px;">It all began in Italy in 1800 when a formal army officer named Felice Bisleri established a company Felice Bisleri &amp; Co, which sold a type of liquor called Ferro-china Bisleri. Following its popularity, he established a plant in India to supply its ingredients. India and Bisleri's relationship thereafter began.&nbsp;</span></h2>
    <h2><span style="font-size: 18px;">After Felice Bisleri died in 1921, his family doctor, Dr Rosse, purchased the company. He and his son-in-law, Commander Casseiandra, came up with the idea of bottled water. After a few years, the factory was sold to a businessman named Khushroo, who then sold it to Jayantilal Chauhan in 1961. And the rest as they say is history!</span></h2>`,
      `
    <h2><span style="font-size: 18px;">Nykaa made a genius move by issuing bonus shares. </span></h2><p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;">Nykaa was giving each shareholder 5 shares for each share they owned, free of cost. </span></h2><p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;"><strong style="font-size: 24px;">But, Here’s the Catch!</strong> </span></h2><p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;">You won't have 6 shares worth Rs. 1,200 each if you previously had 1 share worth Rs. 1,200. Instead, you will own six shares totalling Rs. 200.</span></h2><h2><span style="font-size: 18px;"><br></span></h2><h2><span style="font-size: 18px;"><strong style="font-size: 24px;">Why did Nykaa do this?</strong></span></h2>
    <p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;">Market regulator SEBI has reduced the period, so that Pre-IPO investors can hold their shares from 1 year to 6 months, which will ensure that, they do not have an unfair advantage. </span></h2><p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;">So most of these investors hurriedly sell their shares within 6 months, which decreases stock price in most new-age companies.&nbsp;</span></h2>
    <p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;"><strong style="font-size: 24px;">Nykaa's solution -</strong> </span></h2><p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;">Spread one share's price across multiple shares. Selling with less price and 15% tax is expensive. This way Nykaa can stop investors from leaving. </span></h2><p><span style="font-size: 18px;"><br></span></p><h2><span style="font-size: 18px;">But for Nykaa, things didn't exactly work out. This week, the stock price has decreased by 10%. And net profit has reduced by 50% too. Even if it didn’t turn the tables, this strategy is a genius one.</span></h2>`,
      `<p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 18px;">ITC posted 5K+ Crores Profits
    and issued Rs.6 as a dividend for every share to shareholders.</span></p><p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 18px;"><br></span></p>

<p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 24px;"><strong>ITC’s Legacy:</strong></span></p><p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 24px;"><strong><br></strong></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; text-indent: -0.25in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Symbol;">·&nbsp;</span><span style="font-family: Arial, sans-serif;">Way
    back in 1999, ITC equipped villages with Windows PCs and an internet connection.</span></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; text-indent: -0.25in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Symbol;">·&nbsp;</span><span style="font-family: Arial, sans-serif;">This
    kept the farmers informed about Mandi Vs ITC price everyday. </span></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; text-indent: -0.25in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Symbol;">·&nbsp;</span><span style="font-family: Arial, sans-serif;">ITC
    revolutionized logistics by establishing Mandis within 20-30 Kms from the
    farmers. </span></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>

<p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; text-indent: -0.25in; font-size: 16px;"><span style="font-size: 18px;"><span style="font-family: Symbol;">·&nbsp;</span><span style="font-family: Arial, sans-serif;">This
    eliminated the middlemen who conned farmers to sell produce at government
    Mandis far from the village.</span></span></p><p style="margin-right: 0in; font-family: &quot;Times New Roman&quot;, serif; margin-left: 0.5in; text-indent: -0.25in; font-size: 16px;"><span style="font-size: 18px;"><br></span></p>

<p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 24px;"><strong>Driver for Profit - 2K23:</strong></span></p><p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><br></p>

<p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 18px;">Stable Tobacco Prices -
    Government had not hiked cigarette taxes for more than 2 years.</span></p><p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 18px;"><br></span></p>

<p style="margin-right: 0in; margin-left: 0in; font-family: &quot;Times New Roman&quot;, serif; font-size: 16px;"><span style="font-family: Arial, sans-serif; font-size: 18px;">This led to a steep hike in
    revenue from cigarettes for ITC.</span></p>`,
      `<p><span style="font-size: 18px;">Federal Bank has 50+ FinTech Partnerships. The bank was the first to add 300+ FinTech APIs to its core banking services.</span></p><p><span style="font-size: 24px;"><strong>Products:</strong> </span></p><p><span style="font-size: 18px;">1. Federal Bank X OneCard credit cards for instant loans.</span></p><p><span style="font-size: 18px;">2. Savings Accounts for Jupiter &amp; Fi.</span></p><p><span style="font-size: 18px;">3. Lending with Paisabazaar.</span></p><p><span style="font-size: 18px;">Federal Bank made 803 Crores Profit. The bank has set an example how adopting new ideas fast without hesitation can impact revenue.</span></p><p><span style="font-size: 18px;">SBM Bank is close behind in FinTech adoption. The bank manages an array of products with less to no infrastructure just with FinTech partnerships.</span></p>`,
      `
 
 
 
    <p class="MsoListParagraphCxSpFirst" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; text-indent: -0.25in; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">1.&nbsp;</span><span style="font-family: Arial, sans-serif;">BF
            Investments - This company is the investment arm of the Kalyani conglomerate
            which dabbles in auto components, chemicals and energy. </span></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; font-size: 15px;"><span style="font-family: Arial, sans-serif; font-size: 18px;">BF
            got dumped after a ~42% negative growth in income.</span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; text-indent: -0.25in; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">2.&nbsp;</span><span style="font-family: Arial, sans-serif;">Ansal
            properties and Infrastructure - Ansal is a real estate company which had bad
            debt. </span></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; text-indent: -0.25in; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">3.&nbsp;</span><span style="font-family: Arial, sans-serif;">Starlog
            Enterprises provides port infrastructure and logistics services. Net sales fell
            by 92% from last year. </span></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; text-indent: -0.25in; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">4.&nbsp;</span><span style="font-family: Arial, sans-serif;">BKV
            Enterprises which manufactures LED Bulbs dimmed by ~ Minus 6% in growth.</span></span></p>
    
    <p class="MsoListParagraphCxSpMiddle" style="margin: 0in 0in 0in 0.5in; line-height: 107%; font-family: Calibri, sans-serif; font-size: 15px;"><span style="font-size: 18px;"><span style="font-family: Arial, sans-serif;">&nbsp;</span><br></span></p>
    
    <p class="MsoListParagraphCxSpLast" style="margin: 0in 0in 11px 0.5in; line-height: 107%; font-family: Calibri, sans-serif; text-indent: -0.25in; font-size: 15px;"><span style="font-family: Arial, sans-serif;"><span style="font-size: 18px;">5.&nbsp;</span></span><span style="font-family: Arial, sans-serif; font-size: 18px;">Advance
            Syntex – a company which makes glitter powder had an EBITDA drop of ~4K % and
            hence, stock price was not glittery.</span></p>`,
    ];
    const prices = ["Free", "Premium", "Freemium"];
    const previewsArray = Array.from({ length: 3 }, () =>
      faker.image.transport(600, 360, true)
    );
    const videoLinks = [
      "https://planet-k.s3.ap-south-1.amazonaws.com/1691570965410-324478366.MOV",
      "https://planet-k.s3.ap-south-1.amazonaws.com/1691570968205-282854852.MOV",
      "https://planet-k.s3.ap-south-1.amazonaws.com/1691570970688-664214694.MOV",
    ];
    for (var i = 0; i < 25; i++) {
      tools.push({
        title: faker.random.words(2),
        description: faker.random.words(25),
        image: faker.image.transport(500, 500, true),
        previews: JSON.stringify(previewsArray),
        price: faker.helpers.arrayElement(prices),
        overview: faker.helpers.arrayElement(overviews),
        link: faker.internet.url(),
        videos: JSON.stringify(videoLinks),

        createdAt: faker.date.between(
          "2020-01-01T00:00:00.000Z",
          "2023-03-01T00:00:00.000Z"
        ),
        updatedAt: faker.date.between(
          "2020-01-01T00:00:00.000Z",
          "2023-03-01T00:00:00.000Z"
        ),
      });
    }

    await queryInterface.bulkInsert("tools", tools, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("tools");
  },
};
