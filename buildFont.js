const svgtofont = require("svgtofont");
const path = require("path");

svgtofont({
  src: path.resolve(process.cwd(), "icon"), // svg path
  dist: path.resolve(process.cwd(), "fonts"), // output path
  fontName: "lsharp", // font name
  css: true, // Create CSS files.
  startNumber: 20000, // unicode start number
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true,
    fixedWidth: true,
    centerHorizontally: true
  },
  // website = null, no demo html files
  website: {
    title: "lsharp",
    // Must be a .svg format image.
    logo: path.resolve(process.cwd(), "svg", "git.svg"),
    version: "1.0.0",
    meta: {
      description: "Converts SVG fonts to TTF/EOT/WOFF/WOFF2/SVG format.",
      keywords: "svgtofont,TTF,EOT,WOFF,WOFF2,SVG"
    },
    description: ``,
    links: [
      {
        title: "GitHub",
        url: "https://github.com/jaywcjlove/svgtofont"
      },
      {
        title: "Feedback",
        url: "https://github.com/jaywcjlove/svgtofont/issues"
      },
      {
        title: "Font Class",
        url: "index.html"
      },
      {
        title: "Unicode",
        url: "unicode.html"
      }
    ],
    footerInfo: `Licensed under MIT. (Yes it's free and <a href="https://github.com/jaywcjlove/svgtofont">open-sourced</a>`
  }
}).then(() => {
  console.log("done!");
});
