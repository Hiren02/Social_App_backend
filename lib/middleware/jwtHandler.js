let promise = require('bluebird')
let jwt = promise.promisifyAll(require("jsonwebtoken"))
let TOKEN_EXPIRATION_SEC = "2h";

let genUserToken =(user)=>{
    let options = {expiresIn : TOKEN_EXPIRATION_SEC};
    return jwt.signAsync(user,process.env.JWT_SECRET_KEY,options).then(function(jwtToken){
    return jwtToken
    }).catch((err)=>{
     throw new exceptions.tokenGenException();
    })
}
let verifyUserToken= async (acsToken)=>{
    const token = acsToken.split(" ")[1] || acsToken;
     return jwt.verifyAsync(token,process.env.JWT_SECRET_KEY).then(function(tokenPayload){
        this.tokenPayload = tokenPayload
        return tokenPayload
     }).catch((err)=>{
       return err
     })
}

let genAdminToken = function (admin) {
    let options = { expiresIn: TOKEN_EXPIRATION_SEC };
    return jwt
      .signAsync(admin, process.env.JWT_SECRET_KEY, options)
      .then(function (jwtToken) {
        return jwtToken;
      })
      .catch(function (err) {
        console.log(err);
        throw new exceptions.tokenGenException();
      });
  };

  let verifyAdminToken = function (acsTokn) {
    const token = acsTokn.split(" ")[1];
  
    return jwt
      .verifyAsync(token, process.env.JWT_SECRET_KEY)
      .then(function (tokenPayload) {
        this.tokenPayload = tokenPayload;
        return tokenPayload;
      })
      .catch(function (err) {
        return err.message;
      });
  };

module.exports = {
    genUserToken,
    verifyUserToken,
    genAdminToken,
    verifyAdminToken

}