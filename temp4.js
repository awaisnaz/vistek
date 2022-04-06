import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
//   fs.writeFileSync("./assets/Report.html", dom);
  let pathToHtml = path.join(path.resolve(), "/assets/Report.html");
  await page.goto(`file:${pathToHtml}`, { waitUntil: ["load", "networkidle0"] });
  await page.pdf({ path: './assets/Report.pdf'});
//   pathToHtml = path.join(path.resolve(), "/assets/Report.pdf");
//   if (req.cookies.user) sendemail(req.cookies.user, "Attached is your VISTEK Report.", [{filename: "Report.pdf", path: pathToHtml}]);
  await browser.close();
})();