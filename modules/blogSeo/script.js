"use strict";
const service = require("./service");
const blogService = require("../blog/service");
const BlogCategory = require("../blogCategory/model");

// const DataEntrySeo = async () => {
//   try {
//     const Blogs = await blogService.findAll({
//       include: {
//         model: BlogCategory,
//       },
//     });

//     for (let i in Blogs) {
//       const title = `${Blogs[i].title} - Key Features, Reviews, Pricing, & Alternative Blogs`;
//       const categoryNames = Blogs[i].blogCategories
//         .map((category) => category.name)
//         .join(" and ");
//       const description = `Explore ${Blogs[i].title} on Blogplate: a ${Blogs[i].price} ${categoryNames} blog: Read in-depth features and details, user reviews, pricing, and find alternative blogs of ${Blogs[i].title}. Your one-stop resource for ${Blogs[i].title} insights`;

//       const payload = {
//         title: title,
//         description: description,
//       };

//       const [data, created] = await service.findOrCreate({
//         where: { blogId: Blogs[i].id },
//         defaults: payload,
//       });

//       if (created) {
//         console.log("New SEO entry created for blog ", Blogs[i].id);
//       } else {
//         console.log("SEO entry already exists for blog ", Blogs[i].id);
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

const DataEntrySeo = async () => {
  try {
    const Blogs = await blogService.findAll({
      include: {
        model: BlogCategory,
      },
    });

    for (let i in Blogs) {
      const title = Blogs[i].title;
      const description = Blogs[i].description;

      const payload = {
        title: title,
        description: description,
      };

      const [data, created] = await service.findOrCreate({
        where: { blogId: Blogs[i].id },
        defaults: payload,
      });

      if (created) {
        console.log("New SEO entry created for blog ", Blogs[i].id);
      } else {
        console.log("SEO entry already exists for blog ", Blogs[i].id);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

DataEntrySeo();
