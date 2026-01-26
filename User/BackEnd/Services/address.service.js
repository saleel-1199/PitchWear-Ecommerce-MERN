import mongoose from "mongoose";
import Address from "../Models/address.model.js"

export const getAddressesByUser = async (userId) => {
  return Address.find({
    user_id: new mongoose.Types.ObjectId(userId)
  });
};

export const getAddressById = async (addressId, userId) => {
  return Address.findOne({ _id: addressId, user_id: userId }).lean();
};


export const createAddress = async (userId, data) => {
  const payload = {
    user_id: userId,
    full_name: data.full_name,
    phone_no: data.phone_no,
    alt_phone_no: data.alt_phone_no || "",
    address_line1: data.address_line1,
    city: data.city,
    state: data.state,
    pin_code: data.pin_code,
    type: data.type,
    country: data.country || "India",
    is_default: !!data.is_default
  };
 // console.log(payload)
    if (payload.is_default) {
    await Address.updateMany(
      { user_id: userId },
      { $set: { is_default: false } }
    );
  }

  
  const address = await Address.create(payload);
  return address;
};



export const updateAddress = async (addressId, userId, data) => {
  const address = await Address.findOne({ _id: addressId, user_id: userId });
  if (!address) return null;

 
  if (data.is_default) {
    await Address.updateMany(
      { user_id: userId },
      { $set: { is_default: false } }
    );
  }

  address.full_name = data.full_name;
  address.phone_no = data.phone_no;
  address.alt_phone_no = data.alt_phone_no || "";
  address.address_line1 = data.address_line1;
  address.city = data.city;
  address.state = data.state;
  address.pin_code = data.pin_code;
  address.type = data.type;
  address.is_default = !!data.is_default;

  await address.save();
  return address;
};


export const deleteAddress = async (addressId, userId) => {
  return Address.findOneAndDelete({ _id: addressId, user_id: userId });
};