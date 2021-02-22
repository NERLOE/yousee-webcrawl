import { PhoneStock } from "./index";
const puppeteer = require("puppeteer");

export async function IsPhoneInStock(phone: PhoneStock) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();

  await page.goto(phone.link);

  if (await page.waitForSelector("#declineButton", { timeout: 5000 }))
    await page.click("#declineButton");

  await page.waitForTimeout(4000);

  await page.click(
    "#yousee-mobil-terminal-sale-online > div > div > article > div.component-terminal-details__top > div > div > div.component-terminal-details__config.col-12.col-md-6 > div:nth-child(2) > a"
  );

  const selector =
    "#yousee-mobil-terminal-sale-online > div > div > article > div.component-terminal-details__top > div > div > div.component-terminal-details__config.col-12.col-md-6 > div:nth-child(2) > div > div > div > div > div";
  await page.evaluate(
    (elm: any) => document.querySelector(elm).click(),
    selector + " > fieldset:nth-child(3) > div > div:nth-child(1) > div > input"
  );

  await page.evaluate(
    (elm: any) => document.querySelector(elm).click(),
    selector + " > fieldset:nth-child(5) > div > div:last-child > div > input"
  );

  await page.screenshot({ path: `screenshots/${phone.name}.png` });

  const data = await page.evaluate(() => {
    const status = (document.querySelector(
      "#yousee-mobil-terminal-sale-online > div > div > article > div.component-terminal-details__top > div > div > div.component-terminal-details__config.col-12.col-md-6 > div:nth-child(2) > div > div > div > div > div > button > span"
    ) as HTMLElement).innerHTML;
    return status;
  });

  await browser.close();

  return data == "Ikke på lager" ? false : true;
}

// Leder gennem alle mobiler på denne side, hvor ordet "iPhone" er inkuderet.
// https://yousee.dk/mobil/mobiltelefoner/?icid=mp_pop_No_Term_All
export async function scrapePhones() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto("https://yousee.dk/mobil/mobiltelefoner/");

  if (await page.waitForSelector("#declineButton", { timeout: 5000 }))
    await page.click("#declineButton");

  await page.waitForSelector(
    "#yousee-mobil-terminal-sale-online > div > div > div > article > ul.component-terminal-list__terminal-list.row.row--reduced-gutter"
  );

  const links = await page.evaluate(() => {
    const BRAND_NAME = "Apple";
    const PHONE_SERIES = "iPhone";

    const elements = Array.from(
      document.querySelectorAll(
        "#yousee-mobil-terminal-sale-online > div > div > div > article > ul.component-terminal-list__terminal-list.row.row--reduced-gutter > li"
      )
    );

    const links: PhoneStock[] = [];
    elements.forEach((element) => {
      const brand = (element.querySelector(
        "div > a >  div.component-terminal-card__text-container > div.component-terminal-card__brand"
      ) as HTMLElement).innerHTML;

      if (brand != BRAND_NAME) return;

      const phone = (element.querySelector(
        "div > a > div.component-terminal-card__text-container > div.component-terminal-card__title"
      ) as HTMLElement).innerHTML;

      if (!phone.includes(PHONE_SERIES)) return;

      const previewImage = (element.querySelector(
        "div > a > div.component-terminal-card__image-container > img"
      ) as HTMLImageElement).src;

      const link = (element.querySelector("div > a") as HTMLLinkElement).href;
      links.push({ link, brand, name: phone, previewImage });
    });

    return links;
  });

  await browser.close();

  return links;
}
