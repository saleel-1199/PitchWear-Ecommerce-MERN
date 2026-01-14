import * as addressService from "../Services/address.service.js";


export const addressBookPage = async (req, res) => {
  try {

     console.log("SESSION USER ID:", req.session.userId);
    console.log("REQ.USER:", req.user);


    const addresses = await addressService.getAddressesByUser(req.user._id);
     
    console.log("FETCHED ADDRESSES:", addresses.map(a => ({
  id: a._id,
  user_id: a.user_id,
  full_name: a.full_name
})));


    return res.render("AddressBook", {
      user: req.user,
      addresses,
    });
  } catch (err) {
    console.log("AddressBook Error:", err);
    return res.status(500).send("Server Error");
  }
};


export const addAddressPage = (req, res) => {
  return res.render("AddAddress", { user: req.user });
};


export const createAddressController = async (req, res) => {
  try {
    await addressService.createAddress(req.user._id, req.body);
    return res.redirect("/address");
  } catch (err) {
    console.log("Create Address Error:", err);
    return res.status(500).send("Server Error");
  }
};


export const editAddressPage = async (req, res) => {
  try {
    const address = await addressService.getAddressById(req.params.id, req.user._id);
     
    if (!address) {
      return res.status(404).send("Address not found");
    }

    return res.render("EditAddress", {
      user: req.user,
      address,
    });
  } catch (err) {
    console.log("Edit Address Page Error:", err);
    return res.status(500).send("Server Error");
  }
};


export const updateAddressController = async (req, res) => {
  try {
    const updated = await addressService.updateAddress(
      req.params.id,
      req.user._id,
      req.body
    );

    if (!updated) {
      return res.status(404).send("Address not found");
    }

    return res.redirect("/address");
  } catch (err) {
    console.log("Update Address Error:", err);
    return res.status(500).send("Server Error");
  }
};


export const deleteAddressController = async (req, res) => {
  try {
    await addressService.deleteAddress(req.params.id, req.user._id);
    return res.redirect("/address");
  } catch (err) {
    console.log("Delete Address Error:", err);
    return res.status(500).send("Server Error");
  }
};
