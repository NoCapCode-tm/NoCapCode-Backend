import {Router} from "express"
import { addcasestudy, adminlogin, allemployees, applyForJob, clarity, contactus, createJob, credentialverify, getAllJobs, getcasestudy, getJobApplicants, verify } from "../controller/Job.controller.js"
import { upload } from "../middleware/multer.middleware.js"


const jobrouter = Router()


//post apis
jobrouter.route("/create").post(createJob)
jobrouter.route("/apply").post(applyForJob)
jobrouter.route("/adminlogin").post(adminlogin)
jobrouter.route("/addcasestudy").post(upload.fields([
    { name: "thumbnail", maxCount: 1 },]),
    addcasestudy
)
jobrouter.route("/addcertificate").post(upload.fields([
    { name: "certificate", maxCount: 1 },]),
    credentialverify
)
jobrouter.route("/contactus").post(contactus)
jobrouter.route("/clarity").post(clarity)


//get apis
jobrouter.route("/getjobs").get(getAllJobs)
jobrouter.route("/getcertificate/:credid").get(verify)
jobrouter.route("/getapplicants").get(getJobApplicants)
jobrouter.route("/getallcasestudy").get(getcasestudy)
jobrouter.route("/getalluser").get(allemployees)

export {jobrouter}


