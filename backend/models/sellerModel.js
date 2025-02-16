const { Schema, model } = require("mongoose");

const sellerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    default: "seller",
  },
  status: {
    type: String,

    default: "pending",
  },
  payment: {
    type: String,
    default: "inactive",
  },
  method: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  shopInfo: {
    type: Object,
    default: {},
  },
},{timestamps:true});
module.exports = model("sellers", sellerSchema);
