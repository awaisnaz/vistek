import puppeteer from "puppeteer";

puppeteer.launch()
.then(browser =>{
browser.newPage()
  .then(page =>{
    page.goto("https://google.com");
    page.screenshot({path: "AAAAAAAA.png"});
    page.pdf({path: "AAAAAAA.pdf"});
})
browser.close();
});