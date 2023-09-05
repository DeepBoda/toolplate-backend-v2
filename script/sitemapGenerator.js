const builder = require("xmlbuilder");
const fs = require("fs");
const blogService = require("../modules/blog/service");
const toolService = require("../modules/tool/service");
// Function to fetch country names from an API

// Function to generate the XML sitemap
async function generateBlogSitemap() {
  const countryNames = await blogService.findAll({
    attributes: ["slug"],
  });
  const currentDate = new Date().toISOString().split("T")[0];

  const root = builder.create("urlset", { version: "1.0", encoding: "UTF-8" });
  root.attribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

  for (const data of countryNames) {
    const url = root.ele("url");
    url.ele("loc", {}, `https://toolplate.ai/blog/${data.slug}`);
    url.ele("lastmod", {}, currentDate);
    url.ele("changefreq", {}, "weekly");
    url.ele("priority", {}, "0.9");
  }

  const xml = root.end({ pretty: true });

  // Write the XML to a file
  fs.writeFileSync("blogSitemap.xml", xml);
}
async function generateToolSitemap() {
  const countryNames = await blogService.findAll({
    attributes: ["slug"],
  });
  const currentDate = new Date().toISOString().split("T")[0];

  const root = builder.create("urlset", { version: "1.0", encoding: "UTF-8" });
  root.attribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

  for (const data of countryNames) {
    const url = root.ele("url");
    url.ele("loc", {}, `https://toolplate.ai/tool/${data.slug}`);
    url.ele("lastmod", {}, currentDate);
    url.ele("changefreq", {}, "weekly");
    url.ele("priority", {}, "0.9");
  }

  const xml = root.end({ pretty: true });

  // Write the XML to a file
  fs.writeFileSync("toolSitemap.xml", xml);
}
