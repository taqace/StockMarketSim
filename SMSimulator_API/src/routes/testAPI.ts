var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next){
	res.send("CD set on real REPO");
});


export default router; 

