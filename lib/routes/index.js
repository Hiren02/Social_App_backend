const userRouter = require("../modules/user/userRoute");
const adminRouter = require('../modules/admin/adminRoute');

module.exports = function(app){
   
    app.use('/api/user',userRouter);
    app.use('/api/admin', adminRouter);

}