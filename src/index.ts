import { PhoneStock } from "./global.d";
require("dotenv").config();
import { createTransport } from "nodemailer";
import { scrapePhones, IsPhoneInStock } from "./components/scraping";
import { getScreenshot } from "./utils/tools";
import fs from "fs";

var transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const stock: { [s: string]: PhoneStock } = {};

// "https://yousee.dk/mobil/mobiltelefoner/apple/iphone-12-pro-max/1124/60gb/rate24/"
async function ScrapeAllPhones() {
  console.log("Scraping phones...");
  const phones = await scrapePhones();

  phones.forEach(async (phone: PhoneStock) => {
    const status = await IsPhoneInStock(phone);

    //console.log(phone.name, status, phone.previewImage);
    if (!stock[phone.name]) {
      console.log(phone.name + " stock initialized.");
      stock[phone.name] = { ...phone, status };

      transporter.sendMail({
        from: "YouSee Webscrape",
        to: process.env.EMAI_RECEIVERS,
        attachments: [
          {
            filename: phone.name + ".png",
            content: fs.createReadStream(
              `${process.cwd()}/screenshots/${phone.name}.png`
            ),
          },
        ],
        subject:
          phone.brand +
          " " +
          phone.name +
          " - " +
          (status ? "ER NU PÅ LAGER!!!!" : "Er ikke længere på lager..."),
        html: `<p>Lagerstatusen på ${phone.brand}'s ${
          phone.name
        } er ændret. Telefonen er nu ${
          status ? "på lager" : "ikke længere på lager"
        }.</p><img src="${phone.previewImage}" alt="${phone.name} billede" />`,
      });
    } else if (stock[phone.name].status != status) {
      console.log(phone.name + " STOCK UPDATED!!!!", status);
      stock[phone.name] = { ...phone, status };
    }
  });
}

const interval = 2.5;
ScrapeAllPhones();
setInterval(ScrapeAllPhones, 1000 * 60 * interval);
