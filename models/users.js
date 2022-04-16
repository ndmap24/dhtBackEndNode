var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var users = new Schema({
    metamaskAddress: {
        type: String,
        trim: true,
        required: [true, 'Meta-Mask Address is required']
    },
	collectReward:{
		type: Number,
		default:0
	},
	totalrewards:{
		type: Number,
		default:0
	},
	isDelete:{
		type: Boolean,
		default:false
	},
	status:{
		type: Boolean,
		default:true
	}
},{ timestamps: true });

module.exports = mongoose.model("User", users);