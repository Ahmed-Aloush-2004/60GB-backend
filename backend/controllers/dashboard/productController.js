const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;
const { responseReturn } = require("../../utils/response");
const productModel = require("../../models/productModel");
const { response } = require("express");
class productController {
  add_product = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      console.log(field);

      let {
        sellerId,
        name,
        category,
        description,
        stock,
        price,
        discount,
        shopName,
        brand,
      } = field;
      const { images } = files;

      name = name.trim();
      const slug = name.split(" ").join("-");

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let allImageUrl = [];

        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i].filepath, {
            folder: "products",
          });
          allImageUrl = [...allImageUrl, result.url];
        }

        const product = await productModel.create({
          sellerId: sellerId,
          name,
          slug,
          category: category.trim(),
          description: description.trim(),
          stock: parseInt(stock),
          price: parseInt(price),
          discount: parseInt(discount),
          shopName,
          brand: brand.trim(),
          images: allImageUrl,
        });
        responseReturn(res, 201, { message: "Product Added Successully" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  // End method

  products_get = async (req, res) => {
    const { page, sellerId, searchValue, parPage } = req.query;

    let skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
        const products = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalProduct = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId,
          })
          .countDocuments();

        responseReturn(res, 200, { products, totalProduct });
      } else {
        const products = await productModel
          .find({ sellerId })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalProduct = await productModel
          .find({ sellerId })
          .countDocuments();
        responseReturn(res, 200, { products, totalProduct });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  //End Method

  product_get = async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 200, { product });
    } catch (error) {
      console.log(error.message);
    }
  };

  //End Method

  product_update = async (req, res) => {
    let { name, description, stock, price, discount, brand, productId } =
      req.body;
    name = name.trim();
    const slug = name.split(" ").join("-");
    try {
      await productModel.findByIdAndUpdate(productId, {
        name,
        description,
        stock,
        price,
        discount,
        brand,
        productId,
        slug,
      });
      const product = await productModel.findById(productId);
      responseReturn(res, 200, {
        product,
        message: "Product Updated Successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  //End Method

  product_image_update = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      const { oldImage, productId } = field;
      const { newImage } = files;
      if (err) {
        responseReturn(res, 400, { error: err.message });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });
          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "products",
          });
          if (result) {
            let { images } = await productModel.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await productModel.findByIdAndUpdate(productId, { images });
            const product = await productModel.findById(productId);
            responseReturn(res, 200, {
              product,
              message: "Product Image Updated Successfully",
            });
          } else {
            responseReturn(res, 404, { error: "Image Upload Fails" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: error.message });
        }
      }
    });
  };
  //End Method
}
module.exports = new productController();
