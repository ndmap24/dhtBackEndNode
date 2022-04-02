const users = require("../models/users");
const stake = require("../models/stake");
var jwt = require("jsonwebtoken");
// var http = require('http');
// const fetch = require("cross-fetch");
// const { use } = require("../routes/users");

exports.addNewuser = async (req, res) => {
    const metamaskAddress = req.body.metamaskAddress;
    if (metamaskAddress == undefined || metamaskAddress == null || metamaskAddress == "") {

        return res.json({
            status: 411,
            message: "Please Connect user Meta-Mask"
        })
    }
    else {

        users.findOne({ metamaskAddress: metamaskAddress }, (err, data) => {
            if (err) {
                return res.json({
                    status: 400,
                    message: "Server side error"
                })
            }
            else {
                if (data !== null && data !== undefined && data !== "") {
                    const token = jwt.sign({ data: data }, process.env.SECRET);
                    console.log("token1", token);
                    return res.json({
                        status: 208,
                        message: "User Alreday Exist",
                        data: data,
                        token: token
                    })
                }
                else {

                    var newUser = new users(req.body);
                    newUser.save((err, saveData) => {
                        if (err) {
                            return res.json({
                                status: 400,
                                message: "Something is wrong"
                            })
                        }
                        else {
                            const token = jwt.sign({ data: saveData }, process.env.SECRET);
                            return res.json({
                                status: 201,
                                message: "User Successfully Save.",
                                data: saveData,
                                token: token
                            })
                        }
                    })
                }
            }
        })
    }
}


exports.addStaking = async (req, res) => {
    // console.log("DONE");
    // console.log("Array nft", req.body);
    var stakeNft = req.body.stakeNft;
    var accessToken = req.headers.authorization;
    var token = accessToken && accessToken.split(' ')[1];

    if (token == null)
        return res.sendStatus(401)
    else {
        // console.log("token",token, process.env.SECRET)
        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (err) {
                console.log("err", err);
                return res.sendStatus(403)
            }
            else {
                console.log("user", user.data._id);
                var id = user.data._id;
                users.findById(id, (err, findUser) => {
                    if (err) {
                        return res.json({
                            status: 400,
                            message: "Something is wrong"
                        })
                    }
                    else {
                        if (stakeNft !== null) {
                            var data = {
                                userId: findUser._id,
                                stakeNft: stakeNft,
                                metamaskAddress: findUser.metamaskAddress
                            }
                            var saveData = new stake(data);
                            console.log("saveData", saveData);
                            saveData.save((err, data) => {
                                if (err) {
                                    return res.json({
                                        status: 400,
                                        message: "Something is wrong"
                                    })
                                }
                                else {
                                    return res.json({
                                        status: 200,
                                        message: data
                                    })
                                }
                            });
                        }
                        else {
                            return res.json({
                                status: 400,
                                message: "Please Select Nft for Staking"
                            })
                        }
                    }
                })
            }
        });
    }
}
exports.getReward = async (req, res) => {
    var accessToken = req.headers.authorization;
    var token = accessToken && accessToken.split(' ')[1];
    if (token == null)
        return res.sendStatus(401)
    else {
        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (err) {
                console.log("err", err);
                return res.sendStatus(403)
            }
            else {
                var createdDate;
                var totalstack;
                var stakeLength;
                var price = 0;
                console.log("user", user.data);
                var id = user.data._id;
                users.findById(id,(err,findata)=>{
                    if (err) {
                        return res.json({
                            status: 400,
                            message: "Something is wrong"
                        })
                    }
                    else {

                        var collectReward = findata.collectReward;
                        stake.find({ userId: id }, (err, findStake) => {
                            if (err) {
                                return res.json({
                                    status: 400,
                                    message: "Something is wrong"
                                })
                            }
                            else {
                                totalstack = findStake
                                for (var i = 0; i < totalstack.length; i++) {
                                    var stack = totalstack[i].createdAt
                                    createdDate = stack;
                                    const currentDate = new Date();
                                    const timediff = Math.abs(currentDate - createdDate);
                                    const diffDays = Math.ceil(timediff / (1000 * 60 * 60 * 24)) - 1;
                                    stakeLength = totalstack[i].stakeNft.length;
                                    price += diffDays * stakeLength * 0.375;
                                }
                                console.log("price",price);
                                console.log("collectReward",collectReward);
        
                                price = price - collectReward;
                                // if(price == 0){
                                
                                // }

                                return res.json({
                                    status: 200,
                                    Reward: price
                                });
                            }
                        })
                    }
                })
            }
        })
    }
}
exports.collectReward = async (req, res) => {
    console.log("data Handling");
    var accessToken = req.headers.authorization;
    var reward = req.body.reward;
    console.log("reward",reward);
    var token = accessToken && accessToken.split(' ')[1];
    if (token == null)
        return res.sendStatus(401)
    else {
        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (err) {
                console.log("err", err);
                return res.sendStatus(403)
            }
            else {
                console.log("user",user);
                var id = user.data._id;
                users.findById(id,(err,findData)=>{
                    if (err) {
                        return res.json({
                            status: 400,
                            message: "Something is wrong"
                        })
                    }
                    else {
                        var userReward = findData.collectReward;
                        console.log("userReward",userReward);
                        if(userReward == 0){
                            reward = reward;
                        }
                        else{
                            reward = userReward + reward;
                        }
                        users.findByIdAndUpdate(id,{$set:{collectReward:reward}},(err,update)=>{
                            if (err) {
                                return res.json({
                                    status: 400,
                                    message: "Something is wrong"
                                })
                            }
                            else {
                                console.log("update",update);
                                return res.json({
                                    message:"update"
                                })
                            }
                        })
                    }
                });
            }
        });
    }
}