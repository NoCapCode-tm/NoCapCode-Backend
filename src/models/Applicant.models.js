import mongoose from "mongoose";

const ApplicantSchema = mongoose.Schema({
   name:{
    type:String,
    required:true,
    trim:true,
   },
   email:{
    type:String,
    required:true,
    trim:true,
    unique:true
   },
   resumelink:{
      type:String,
      required:true,
   },
   linkedin:{
      type:String,
      required:true,
   },
   github:{
      type:String,
   },
   phonenumber:{
    type:Number,
    required:true,
   },
   dob:{
        type:Date,
        default:"",
    },
    gender:{
        type:String,
        default:""
    },
   other:[{
      key:{
         type:String,
         default:""
      },
      value:{
         type:String,
         default:""
      },
      default:[]
   }],
   jobtitle:{
    type:String,
    required:true
   }
},{timestamps:true})

export const Applicant = new mongoose.model("Applicant",ApplicantSchema)