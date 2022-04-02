const jwt = require('jsonwebtoken');

exports.verifyAuth = async (req, res, next) => {
    try{
        console.log("In Auth");
        const {authorization} = req.headers;
        const token = authorization.replace('Bearer ', '')
        if(!token){
            res.status(419).json({
                status: 0 ,
                message: "authorization is required."
            })
        }
        await jwt.verify(token, process.env.SECRET,  function(error, data) {
            if(error){
                res.status(401).json({message:error, status: 0});
            }
            // console.log(decoded.foo) // bar
            req.user = data.data;
            next();
        });
    }catch(error){
        res.status(419).json({
            status: 0 ,
            message: "authorization is failed.",
            error
        })
    }
}