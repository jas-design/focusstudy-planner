const fs = require("fs");
const path = require("path");
const sass = require("sass");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
const htmlPath = path.join(srcDir, "index.html");
const scssPath = path.join(srcDir, "scss", "main.scss");
const jsFiles = [
  "storage.js",
  "state.js",
  "momentum.js",
  "render.js",
  "backup.js",
  "app.js"
].map((fileName) => path.join(srcDir, "js", fileName));
const outPath = path.join(distDir, "FocusStudyPlanner.html");

function assertFileExists(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`Required build input is missing: ${path.relative(root, filePath)}`);
  }
}

function escapeInlineScript(source) {
  return source
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--");
}

[htmlPath, scssPath, ...jsFiles].forEach(assertFileExists);

const css = sass.compile(scssPath, {
  style: "compressed",
  loadPaths: [path.join(srcDir, "scss")]
}).css;

const js = escapeInlineScript(jsFiles.map((jsPath) => fs.readFileSync(jsPath, "utf8")).join("\n\n"));
const html = fs.readFileSync(htmlPath, "utf8")
  .replace("<!-- FOCUSSTUDY_CSS -->", `<style>\n${css}\n</style>`)
  .replace("<!-- FOCUSSTUDY_JS -->", `<script>\n${js}\n</script>`);

fs.mkdirSync(distDir, { recursive: true });
fs.readdirSync(distDir)
  .filter((fileName) => /^FocusStudyPlanner.*\.html$/i.test(fileName) && fileName !== path.basename(outPath))
  .forEach((fileName) => {
    fs.unlinkSync(path.join(distDir, fileName));
  });
fs.writeFileSync(outPath, html);
console.log(`Built ${path.relative(root, outPath)}`);
