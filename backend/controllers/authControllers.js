const adminModel = require("../models/adminModel");
const { responseReturn } = require("../utils/response");
const bcrypt = require("bcrypt");
const { createToken } = require("../utils/tokenCreate");
const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/chat/sellerCustomer");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select("+password");
      if (admin) {
        const match = await bcrypt.compare(password, admin.password);

        if (match) {
          const token = await createToken({
            id: admin._id,
            role: admin.role,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login Successful" });
        } else {
          responseReturn(res, 404, { error: "Password Wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not Found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_login = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
      const seller = await sellerModel.findOne({ email }).select("+password");
      if (seller) {
        const match = await bcrypt.compare(password, seller.password);

        if (match) {
          const token = await createToken({
            id: seller.id,
            role: seller.role,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login Successful" });
        } else {
          responseReturn(res, 404, { error: "Password Wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not Found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_register = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      const getUser = await sellerModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: "Email Already Exist" });
      } else {
        const seller = await sellerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: "menualy",
          shopInfo: {},
        });
        console.log(seller);

        await sellerCustomerModel.create({
          myId: seller.id,
        });
        const token = await createToken({ id: seller.id, role: seller.role });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, { token, message: "Register Success" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  getUser = async (req, res) => {
    // const {role,id}=req;
    console.log(req.id);
    console.log(req.role);

    // const role = "seller";
    // seller ahmed
    // const id = "66ccd089e7a0aaa440bddec0";
    //seller ali
    // const id="66d29287217cdf25dd0ce380"
    
    //admin
    const role = "admin";
    const id = "66c38e554c782b0aff220ae2";

    try {
      if (role == "admin") {
        const user = await adminModel.findById(id);

        responseReturn(res, 200, { userInfo: user });
      } else {
        const seller = await sellerModel.findById(id);
        console.log("seller", seller);

        responseReturn(res, 200, { userInfo: seller });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  //End Method

  profile_image_upload = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });
      const { id } = fields;
      const { image } = files;

      try {
        const result = await cloudinary.uploader.upload(image.filepath, {
          folder: "profile",
        });
        if (result) {
          await sellerModel.findByIdAndUpdate(id, { image: result.url });
          const userInfo = await sellerModel.findById(id);
          responseReturn(res, 201, {
            message: "Profile Image Upload Successfully",
            userInfo,
          });
        } else {
          responseReturn(res, 404, { error: "Image Upload Failed" });
        }
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  //End Method
  profile_info_add = async (req, res) => {
    const { division, district, shopName, sub_district } = req.body.state;
    const { id } = req.body;
    try {
      await sellerModel.findByIdAndUpdate(id, {
        shopInfo: {
          shopName,
          district,
          division,
          sub_district,
        },
      });
      const userInfo = await sellerModel.findById(id);
      responseReturn(res,201,{message:"Profile info Add Successfully",userInfo})
    } catch (error) {
      responseReturn(res,500,{error:error.message})

    }
  };
}

module.exports = new authControllers();
