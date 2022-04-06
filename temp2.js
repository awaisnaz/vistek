import phantom from "phantom";
import path from "path";

(async function() {
    const instance = await phantom.create();
    const page = await instance.createPage();
    // fs.writeFileSync("./assets/Report.html", dom);
    let pathToHtml = path.join(path.resolve(), "/assets/Report.html");

    // await page.property('viewportSize', {width: 1024, height: 600});
    const status = await page.open("http://vistek.eu-west-2.elasticbeanstalk.com/Report.html");
    console.log(`Page opened with status [${status}].`);

    await page.render('./assets/Report.pdf');
    console.log(`File created at [./stackoverflow.pdf]`);

    await instance.exit();
}());