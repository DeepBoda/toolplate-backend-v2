const builder = require("xmlbuilder");
const fs = require("fs");
const blogService = require("../modules/blog/service");
const toolService = require("../modules/tool/service");
const categoryService = require("../modules/category/service");

// Function to generate the XML sitemap
const BlogSitemap = async () => {
  const blogs = await blogService.findAll({
    attributes: ["slug"],
  });
  const currentDate = new Date().toISOString().split("T")[0];

  const root = builder.create("urlset", { version: "1.0", encoding: "UTF-8" });
  root.attribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

  for (const data of blogs) {
    const url = root.ele("url");
    url.ele("loc", {}, `https://toolplate.ai/blog/${data.slug}`);
    url.ele("lastmod", {}, currentDate);
    url.ele("changefreq", {}, "weekly");
    url.ele("priority", {}, "0.9");
  }

  const xml = root.end({ pretty: true });

  // Write the XML to a file
  fs.writeFileSync("blogSitemap.xml", xml);
};
const ToolSitemap = async () => {
  const tools = await toolService.findAll({
    attributes: ["slug"],
  });
  const currentDate = new Date().toISOString().split("T")[0];

  const root = builder.create("urlset", { version: "1.0", encoding: "UTF-8" });
  root.attribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

  for (const data of tools) {
    const url = root.ele("url");
    url.ele("loc", {}, `https://toolplate.ai/tool/${data.slug}`);
    url.ele("lastmod", {}, currentDate);
    url.ele("changefreq", {}, "weekly");
    url.ele("priority", {}, "0.9");
  }

  const xml = root.end({ pretty: true });

  // Write the XML to a file
  fs.writeFileSync("toolSitemap.xml", xml);
};
const CategorySitemap = async () => {
  const categories = await categoryService.findAll({
    attributes: ["slug"],
  });

  // Use a constant for the XML namespace
  const XML_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";

  // Create a root XML element
  const root = builder.create("urlset", { version: "1.0", encoding: "UTF-8" });
  root.attribute("xmlns", XML_NAMESPACE);

  // Get the current date in ISO format
  const currentDate = new Date().toISOString().split("T")[0];

  // Function to generate URLs for each category
  function generateCategoryUrls(categorySlug) {
    const baseSlug = `https://toolplate.ai/tools/${categorySlug}`;
    const urlVariations = ["", "/free", "/freemium", "/premium"];

    // Create and return URL elements
    return urlVariations.map((variation) => ({
      loc: baseSlug + variation,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: "0.9",
    }));
  }

  // Generate and add URLs for each category
  for (const category of categories) {
    const categorySlug = category.slug;
    const categoryUrls = generateCategoryUrls(categorySlug);

    // Add URL elements to the XML
    categoryUrls.forEach((urlData) => {
      const urlElement = root.ele("url");
      Object.entries(urlData).forEach(([tagName, tagValue]) => {
        urlElement.ele(tagName, {}, tagValue);
      });
    });
  }

  // Generate the XML content
  const xml = root.end({ pretty: true });

  // Write the XML to a file
  fs.writeFileSync("categorySitemap.xml", xml);
};

BlogSitemap();
ToolSitemap();
CategorySitemap();
