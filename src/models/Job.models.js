import mongoose from "mongoose" 

const JobSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    noofapplicants:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    responsibilities:{
        type:String,
        required:true,
    },
    mode:{
        type:String,
        enum:["Remote","OnSite","Hybrid"]
    },
    department:{
        type:String,
        enum:["Human Resource","Designing","Engineering","Marketing","Sales","Operations","Finance","Other"],
    },
    perks:{
        type:String,
        required:true,
    },
    whoshouldapply:{
        type:String,
        required:true,
    },
    employementtype:{
        type:String,
        required:true,
    },
    applicants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Applicant"
    }]
},{timestamps:true})

export const Job = new mongoose.model("Job",JobSchema)