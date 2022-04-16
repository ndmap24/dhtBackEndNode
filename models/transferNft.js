var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var transferNft = new Schema({
    userId:{
		type: Schema.Types.ObjectId,
		ref: 'User'
    },
    metamaskAddress: {
        type: String,
        trim: true,
        required: [true, 'Meta-Mask Address is required']
    },
	DH:{
		type: Number,
	},
	DHF:{
		type: Number,
    },
    reward_collect:{
        type: Boolean,
        default: false
    },
    DHT_reward:{
        type: Number
    },
    DHFnft_reward:{
        type: Number
    },
	isDelete:{
		type: Boolean,
		default:false
    },
    status:{
        type: Number,
        default: 0
    }
},{ timestamps: true });

module.exports = mongoose.model("TransferNft", transferNft);