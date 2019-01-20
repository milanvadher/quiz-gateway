exports.transform = function(req, res, next) {
    let oldSend = res.send;

    res.send = function(code, body, headers){
        let response = {
            "status": code, 
            "message": "",
            "data": body
        }
        oldSend.apply(res, [code, response, headers]);
    }
    next();
}