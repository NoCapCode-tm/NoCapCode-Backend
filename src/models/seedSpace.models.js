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
    },
    requirementType:{
        type:String,
        required:true,
        enum: ['Web Development', 'E-commerce Development', 'Web + E-commerce Development', 'Custom Development']
    },
    currentWebsite:{
        type:String,
        required:false
    }
},{
    timestamps: true
})

export const SeedSpace = mongoose.model("SeedSpace", seedSpaceSchema)