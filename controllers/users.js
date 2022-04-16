const users = require("../models/users");
const stake = require("../models/stake");
var jwt = require("jsonwebtoken");
// var http = require('http');
// const fetch = require("cross-fetch");
// const { use } = require("../routes/users");
var TrnasferNFT = require("../models/transferNft")

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
    const arrOfNum = stakeNft.map(str => {
        return Number(str);
    });
    console.log("arrOfNum", arrOfNum);

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
                        if (arrOfNum !== null) {
                            var data = {
                                userId: findUser._id,
                                stakeNft: arrOfNum,
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
                users.findById(id, (err, findata) => {
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
                                    console.log("diffDays", diffDays);
                                    stakeLength = totalstack[i].stakeNft.length;
                                    price += diffDays * stakeLength * 0.375;
                                }
                                console.log("price", price);
                                console.log("collectReward", collectReward);
                                console.log("findata.totalrewards", findata.totalrewards);
                                users.findByIdAndUpdate(id, { $set: { totalrewards: price } }, (err, updatedData) => {
                                    if (err) {
                                        return res.json({
                                            status: 400,
                                            message: "Something is Wrong"
                                        });
                                    }
                                    else {
                                        console.log("Data Successfully updated", updatedData);
                                        // price = price - collectReward;
                                        if (collectReward > price) {
                                            return res.json({
                                                status: 200,
                                                Reward: collectReward - price
                                            });
                                        }
                                        else if (collectReward == 0) {
                                            return res.json({
                                                status: 200,
                                                Reward: price
                                            });
                                        }
                                        else {
                                            return res.json({
                                                status: 200,
                                                Reward: price - collectReward
                                            });
                                        }
                                    }
                                })
                                // price = price - collectReward;
                                // var totalrewards = findata.totalrewards;
                                // if(totalrewards == undefined && totalrewards !== null && totalrewards !== ""){

                                // }
                                // if(price == 0){
                                // }
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
    console.log("reward", reward);
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
                console.log("user", user);
                var id = user.data._id;
                users.findById(id, (err, findData) => {
                    if (err) {
                        return res.json({
                            status: 400,
                            message: "Something is wrong .",
                            error: err
                        })
                    }
                    else {
                        var userReward = findData.collectReward;
                        console.log("userReward", userReward);
                        if (userReward == 0) {
                            console.log("reward", reward);
                            reward = reward;
                        }
                        else {
                            console.log("findData.totalrewards-userReward", findData.totalrewards - userReward);
                            if (reward <= (findData.totalrewards - userReward)) {
                                reward = Number(userReward) + Number(reward);
                                console.log("userReward + reward", reward);
                            }
                            else {
                                return res.json({
                                    status: 402,
                                    message: "You have no more rewards"
                                })
                            }
                        }
                        console.log("rewardrewardrewardreward", reward);
                        users.findByIdAndUpdate(id, { $set: { collectReward: Number(reward) } }, (err, update) => {
                            if (err) {
                                return res.json({
                                    status: 400,
                                    message: "Something is wrong !",
                                    error: err
                                })
                            }
                            else {
                                console.log("update", update);
                                return res.json({
                                    message: "update"
                                })
                            }
                        })
                    }
                });
            }
        });
    }
}
exports.unStakeNft = async (req, res) => {
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
                console.log("Done");
                var unStakeArr = req.body.unStakeArr;
                console.log("unStakeArr", unStakeArr);
                if (unStakeArr == undefined || unStakeArr == "" || unStakeArr == null) {
                    return res.json({
                        status: 400,
                        message: "Please Select Nft's For UnStake"
                    });
                }
                console.log("user", user.data._id);
                var id = user.data._id;
                users.findById(id, (err, findUser) => {
                    if (err) {
                        return res.json({
                            status: 400,
                            message: "Something is wrong"
                        });
                    }
                    else {
                        var userId = findUser._id;
                        console.log("userId", userId);
                        stake.find({ userId: userId }, async (err, totalStake) => {
                            if (err) {
                                return res.json({
                                    status: 400,
                                    message: "Something is wrong"
                                });
                            }
                            else {
                                console.log("totalStake.length", totalStake.length);
                                const arrOfNum = unStakeArr.map(str => {
                                    return Number(str);
                                });
                                console.log("arrOfNum", arrOfNum);
                                for (let i = 0; i < totalStake.length; i++) {
                                    stake.updateOne({ _id: totalStake[i]._id }, { $pullAll: { 'stakeNft': arrOfNum } }, (err, finallyUpdate) => {
                                        if (err) {
                                            return res.json({
                                                status: 400,
                                                message: "Something is wrong"
                                            });
                                        }
                                        else {
                                            console.log("Done");
                                        }
                                    });
                                }
                                return res.json({
                                    status: 200,
                                    message: "Successfully Unstake NFT's"
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

exports.trnasferNFT = async (req, res) => {
    try {
        console.log("api calling");
        var date = new Date();
        // add a day
        date.setDate(date.getDate() - 1);
        var saveData = {
            userId: req.user._id,
            metamaskAddress: req.user.metamaskAddress,
            DH: req.body.DH,
            DHF: req.body.DHF,
            DHT_reward: req.body.DH * 200,
            DHFnft_reward: req.body.DHF * 1600,
            createdAt: new Date(date),
            updatedAt: new Date(date)
        }
        console.log("saveData", saveData)
        var transferNfts = await TrnasferNFT.create(saveData)
        return res.json({ status: 200, data: transferNfts })
    } catch (err) {
        return res.json({ status: 500, message: err.message })
    }
}

exports.GVOreward = async (req, res) => {
    try {
        var userId = req.user._id
        console.log("req.user._id ", req.user._id)
        var transferNfts = await TrnasferNFT.find({ "userId": req.user._id, reward_collect: false })
        if (transferNfts.length == 0) {
            console.log("transferNfts.length", transferNfts.length)
            return res.json({ status: 400, message: "USer Not found" })
        }
        var collector = 0
        var total_DHF = 0
        var a = await TrnasferNFT.aggregate([
            // { $match: { userId: userId} },
            {
                $group: {
                    _id: "$userId",
                    total: { $sum: { $add: "$DHF" } }
                }
            },
        ])
        if (a[0].total > 10) {
            transferNfts.forEach(item => {
                total_DHF += item.DHF
                const currentDate = new Date();
                const timediff = Math.abs(currentDate - item.createdAt);
                const diffDays = Math.ceil(timediff / (1000 * 60 * 60 * 24)) - 1;
                if (diffDays >= 1) {
                    collector += item.DHT_reward + item.DHFnft_reward + (item.DH * diffDays * 0.375) + (item.DHF * diffDays * 11)
                }
            })
        } else {
            transferNfts.forEach(item => {
                total_DHF += item.DHF
                const currentDate = new Date();
                const timediff = Math.abs(currentDate - item.createdAt);
                const diffDays = Math.ceil(timediff / (1000 * 60 * 60 * 24)) - 1;
                if (diffDays >= 1) {
                    collector += item.DHT_reward + item.DHFnft_reward + (item.DH * 30 * 0.375) + (item.DHF * 30 * 11)
                }
            })
        }
        console.log(collector)
        return res.json({ status: 200, data: collector, total_DHF })
    } catch (err) {
        console.log(err)
        return res.json({ status: 500, message: err.message })

    }
}

exports.CollectGVOreward = async (req, res) => {
    try {
        var userId = req.user._id
        console.log("req.user._id ", req.user._id)
        var transferNfts = await TrnasferNFT.find({ "userId": req.user._id, reward_collect: false })
        if (transferNfts.length == 0) {
            console.log("transferNfts.length", transferNfts.length)
            return res.json({ status: 400, message: "USer Not found" })
        }
        var collector = 0
        var total_DHF = 0
        var a = await TrnasferNFT.aggregate([
            {
                $group: {
                    _id: "$userId",
                    total: { $sum: { $add: "$DHF" } }
                }
            },
        ])
        if (a[0].total > 10) {
            transferNfts.forEach(async item => {
                total_DHF += item.DHF
                const currentDate = new Date();
                const timediff = Math.abs(currentDate - item.createdAt);
                const diffDays = Math.ceil(timediff / (1000 * 60 * 60 * 24)) - 1;
                if (diffDays >= 1) {
                    collector += item.DHT_reward + item.DHFnft_reward + (item.DH * diffDays * 0.375) + (item.DHF * diffDays * 11)
                    var collected_reward = await TrnasferNFT.updateMany({ userId: userId, $set: { reward_collect: true } })
                    console.log("collected_reward", collected_reward)
                    return res.json({ status: 200, message: "Reward collected" })

                }
            })
        } else {
            transferNfts.forEach(async item => {
                total_DHF += item.DHF
                const currentDate = new Date();
                const timediff = Math.abs(currentDate - item.createdAt);
                const diffDays = Math.ceil(timediff / (1000 * 60 * 60 * 24)) - 1;
                if (diffDays >= 1) {
                    collector += item.DHT_reward + item.DHFnft_reward + (item.DH * 30 * 0.375) + (item.DHF * 30 * 11)
                    var collected_reward = await TrnasferNFT.updateMany({ userId: req.user._id }, { $set: { reward_collect: true } })
                    console.log("collected_reward", collected_reward)
                    return res.json({ status: 200, message: "Reward collected" })


                }
            })
        }
        // console.log(collector)
        // return res.json({status:200, message: "Reward collected"})
    } catch (err) {
        console.log(err)
        return res.json({ status: 500, message: err.message })

    }
}