import mongoose from "mongoose"

const seedSpaceSchema = mongoose.Schema({

    businessName:{
        type: String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    teamSize:{
        type:Number,
        required:true
    }
},{
    timestamp: true
})

export const SeedSpace = new mongoose.model("SeedSpace",seedSpaceSchema)