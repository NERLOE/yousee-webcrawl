import fs from "fs";
import { PhoneStock } from "./../global.d";
import * as path from "path";

export async function getScreenshot(phone: PhoneStock) {
  return new Promise((resolve: any, reject: any) => {
    const filePath = `${process.cwd()}/screenshots/${phone.name}.png`;
    fs.readFile(filePath, (err, data: any) => {
      if (err) {
        console.log("%c[FEJL] " + err.message, "color: red");
        return reject(err);
      }

      let extensionName = path.extname(filePath);

      let base64Image = new Buffer(data, "binary").toString("base64");

      let imgSrcString = `data:image/${extensionName
        .split(".")
        .pop()};base64,${base64Image}`;

      return resolve(imgSrcString);
    });
  });
}
