var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var stake = new Schema({
	userId:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	stakeNft:{
		type: Array,
		trim: true,
	},
    metamaskAddress: {
        type: String,
        trim: true,
        required: [true, 'Meta-Mask Address is required']
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

module.exports = mongoose.model("Stake", stake);