import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {type:String, required:true},
    lastName: {type:String,required:true},
    email: {type:String, required:true},
    phone: {type:Number, required:true},
    password: {type:String, requied:true}
})

export  const userModal = mongoose.model.users || mongoose.model('users', UserSchema)