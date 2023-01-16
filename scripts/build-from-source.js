const fs = require("fs/promises");
const path = require("path");

// This is a quick and dirty script. Don't use it as is, please. No guarantees.

const getPageDirectories = async () => {
    const result = await fs.readdir(path.join("src", "pages"));
    return result;
}

const getExistingPageDirectories = async () => {
    const allFiles = await fs.readdir(path.join("docs"));
    result = allFiles.filter((e) => e.includes("day"))
    return result;
}

const getPageInfo = async (pageDir) => {
    const rawJson = await fs.readFile(path.join("src", "pages", pageDir, "info.json"));
    const object = JSON.parse(rawJson);
    const result = {path:pageDir, ...object};
    return result;

}

const parseHomeHTML = async () => {
    const homeHtml = await fs.readFile(path.join("src", "home", "index.html"));
    const result = homeHtml.toString()
    return result;
}

const genHomePageWithLinks = async () => {
    
    //This function finds the table in the home page and replaces it with a table of links

    const pages = await getPageDirectories();
    const pageInfoArray = await Promise.all(pages.map(async (e) => await getPageInfo(e)));

    const tableStart = `<table><thead><tr><th>Day</th><th>Title</th><th>Prompt</th></tr></thead><tbody>`
    const tableContent = pageInfoArray.map((e) => `<tr><td>Day ${e.day}</td><td><a href="/challenge-123/${e.path}">${e.title}</a></td><td>${e.prompt}</td></tr>`).join("");
    const tableEnd = `</tbody></table>`;

    const table = tableStart + tableContent + tableEnd;

    const initialHomePage = await parseHomeHTML();
    const splitHomePage = initialHomePage.split(/(<table>)(.|\t|\n|\r)*(<\/table>)/gm);
    const newHomePage = splitHomePage[0] + table + splitHomePage[2];

    return newHomePage;
}

const buildHomePage = async () => {
    
    await fs.copyFile(path.join("src", "home", "stylesheet.css"), path.join("docs", "stylesheet.css"));
    await fs.copyFile(path.join("src", "home", "script.js"), path.join("docs", "script.js"));

    const indexPageContent = await genHomePageWithLinks();
    await fs.writeFile(path.join("docs", "index.html"), indexPageContent);

    console.log("Built home page");

    
}

const copyOverNewPages = async () => {
    const existingPageDirs = await getExistingPageDirectories();
    const sourcePageDirs = await getPageDirectories();
    const newPages = sourcePageDirs.filter((e) => !existingPageDirs.includes(e))
    if (newPages.length < 1) {
        console.log(Error("No new pages found."));
        return;
    }
    
    await Promise.all(newPages.map(async (e) => {
        const fileList = await fs.readdir(path.join("src", "pages", e));
        await fs.mkdir(path.join("docs", e));
        console.log("created " + e);
        await Promise.all(fileList.map(async (f) => {
            await fs.copyFile(path.join("src", "pages", e, f), path.join("docs", e, f));
            console.log("created " + e + "/" + f);
        }))
    }))

    console.log("done")

}

copyOverNewPages();
buildHomePage();