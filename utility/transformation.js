exports.transform = function(req, res, next) {
    let oldSend = res.send;

    res.send = function(code, body, headers){
        let response = {
            "status": code, 
            "message": body.msg,
            "data": body
        };
        oldSend.apply(res, [code, response, headers]);
    }
    next();
}