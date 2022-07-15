const user = require('../_models/user.model');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const formidable = require('formidable');
const cloudinary = require('../_helpers/cloudinary.helper');
const ObjectID = require('mongodb').ObjectId;
const displayId = require('../_helpers/displayId.helper');
exports.userSignUp = (req, res) => {
    const form = new formidable.IncomingForm({ multiples: true });
    form.parse(req, (err, fields, files) => {
        user.findOne({ email: fields.email }).then((found) => {
            if (found == null) {
                displayId.genrate('user').then((displayId) => {
                    bcryptjs.hash(fields.password, 10).then((hashed) => {
                        if (files.profileImage == undefined) {
                            let ins = new user({
                                name: fields.name,
                                email: fields.email,
                                password: hashed,
                                displayId: displayId,
                            })
                            ins.save().then((created) => {
                                if (created == null) {
                                    res.status(500).json({ err: true, msg: "An error occurred, Please try again later." });
                                } else {
                                    res.status(200).json({ err: false, msg: "User SignUp successfully." });
                                }
                            }).catch((err) => {
                                res.status(500).json({ err: true, msg: err });
                            });
                        } else {
                            cloudinary.upload(files).then((uploaded) => {
                                let ins = new user({
                                    name: fields.name,
                                    email: fields.email,
                                    password: hashed,
                                    displayId: displayId,
                                    profileImage: uploaded,
                                })
                                ins.save().then((created) => {
                                    if (created == null) {
                                        res.status(500).json({ err: true, msg: "An error occurred, Please try again later." });
                                    } else {
                                        res.status(200).json({ err: false, msg: "User SignUp successfully." });
                                    }
                                }).catch((err) => {
                                    console.error(err)
                                    res.status(500).json({ err: true, msg: err });
                                });
                            }).catch((err) => {
                                console.error(err)
                                res.status(500).json({ err: true, msg: err });
                            });
                        }
                    }).catch((err) => {
                        console.error(err)
                        res.status(500).json({ err: true, msg: err });
                    });
                }).catch((err) => {
                    console.error(err)
                    res.status(500).json({ err: true, msg: err });
                });
            } else {
                res.status(500).json({ err: true, msg: "email is already exists." });
            }
        }).catch((err) => {
            console.error(err)
            res.status(500).json({ err: true, msg: err });
        });
    })
}
exports.userLogin = (req, res) => {
    user.findOne({ email: req.body.email }).then((found) => {
        bcryptjs.compare(req.body.password, found.password).then((compared) => {
            if (compared == true) {
                let token = jsonwebtoken.sign({ _id: found._id }, 'privateKey');
                res.status(200).json({ err: false, msg: "User Login successfully.", token: token });
            } else {
                res.status(500).json({ err: true, msg: "Password is incorrect." });
            }
        }).catch((err) => {
            res.status(500).json({ err: true, msg: err });
        });
    }).catch((err) => {
        res.status(500).json({ err: true, msg: err });
    });
}
exports.getAllUsers = (req, res) => {
    user.find({}).then((users) => {
        res.status(200).json({ err: false, msg: "User retrieve  successfully.", users: users });
    }).catch((err) => {
        res.status(500).json({ err: true, msg: err });
    })
}
exports.updateUser = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        user.findOne({ _id: ObjectID(req.params.userId) }).then((found) => {
            if (found == null) {
                res.status(500).json({ err: true, msg: "User is not found." });
            } else {
                const body = {
                    name: fields.name,
                    profileImage: '',
                }
                if (files.profileImage === undefined) {
                    delete body.profileImage;
                    admin.updateOne({ _id: ObjectID(req.params.userId) }, { $set: body }).then((updateUser) => {
                        if (updateUser.modifiedCount == 0) {
                            res.status(500).json({ err: true, msg: "An error occurred, Please try again later." });
                        } else {
                            user.findOne({ _id: ObjectID(req.params.userId) }).then((found) => {
                                if (found == null) {
                                    res.status(500).json({ err: true, msg: "User is not found." });
                                } else {
                                    res.status(200).json({ err: false, msg: "User is updated successfully.", user: found });
                                }
                            }).catch((err) => {
                                res.status(500).json({ err: true, msg: err });
                            });
                        }
                    }).catch((err) => {
                        res.status(500).json({ err: true, msg: err });
                    })
                } else {
                    cloudinary.upload(files).then((uploaded) => {
                        const body = {
                            name: fields.name,
                            profileImage: uploaded,
                        }
                        user.updateOne({ _id: ObjectID(req.params.userId) }, { $set: body }).then((updateUser) => {
                            console.log(updateUser)
                            if (updateUser.modifiedCount == 0) {
                                res.status(500).json({ err: true, msg: "An error occurred, Please try again later." });
                            } else {
                                user.findOne({ _id: ObjectID(req.params.userId) }).then((found) => {
                                    if (found == null) {
                                        res.status(500).json({ err: true, msg: "User is not found." });
                                    } else {
                                        res.status(200).json({ err: false, msg: "User is updated successfully.", user: found });
                                    }
                                }).catch((err) => {
                                    res.status(500).json({ err: true, msg: err });
                                });
                            }
                        }).catch((err) => {
                            res.status(500).json({ err: true, msg: err });
                        });
                    }).catch((err) => {
                        res.status(500).json({ err: true, msg: err });
                    });
                }
            }
        }).catch((err) => {
            res.status(500).json({ err: true, msg: err });
        });
    });
}