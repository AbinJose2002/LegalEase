import mongoose from "mongoose";

export const connection = async () =>{
    const response = await mongoose.connect("mongodb+srv://abinjos307:abinjos307@cluster0.j9flw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(()=>{console.log("connercted")}).catch((error)=>{console.log("connection unsuccess ",error)})
}