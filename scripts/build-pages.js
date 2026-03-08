// scripts/build-pages.js
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "../src");
const rootDir = path.join(__dirname, "..");

// 找出src下所有JSX（排除*-main.jsx）
const components = fs
  .readdirSync(srcDir)
  .filter((f) => f.endsWith(".jsx") && !f.endsWith("-main.jsx"))
  .map((f) => f.replace(".jsx", ""));

const viteInputs = {};

components.forEach((name) => {
  // 生成入口JSX
  const mainContent = `import React from "react";
import ReactDOM from "react-dom/client";
import Component from "./${name}";
ReactDOM.createRoot(document.getElementById("root")).render(<Component />);
`;
  fs.writeFileSync(path.join(srcDir, `${name}-main.jsx`), mainContent);

  // 生成HTML
  const htmlName = name === "heat-pump-visualizer" ? "index" : name;
  const htmlContent = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/${name}-main.jsx"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(rootDir, `${htmlName}.html`), htmlContent);
  viteInputs[htmlName] = path.join(rootDir, `${htmlName}.html`);
});

// 生成导航首页（如果多于1个组件）
if (components.length > 1) {
  const links = components
    .map((name) => {
      const htmlName = name === "heat-pump-visualizer" ? "index" : name;
      return `<li><a href="/${htmlName}.html">${name}</a></li>`;
    })
    .join("\n      ");

  const navHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>All Pages</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    a { color: #2563eb; text-decoration: none; font-size: 18px; }
    li { margin: 12px 0; }
  </style>
</head>
<body>
  <h1>All Pages</h1>
  <ul>${links}</ul>
</body>
</html>`;
  fs.writeFileSync(path.join(rootDir, "nav.html"), navHtml);
  viteInputs["nav"] = path.join(rootDir, "nav.html");
}

// 生成vite.config.js
const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: ${JSON.stringify(viteInputs, null, 8)},
    },
  },
});
`;
fs.writeFileSync(path.join(rootDir, "vite.config.js"), viteConfig);

console.log("Generated pages for:", components.join(", "));