import { Job } from "../models/Job.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import jwt from "jsonwebtoken";
import { Applicant } from "../models/Applicant.models.js";
import { Case } from "../models/CaseStudies.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import { Resend } from 'resend';
import { Employee} from "../models/Employee.models.js";
import { SeedSpace } from "../models/seedSpace.models.js";

export const createJob =asynchandler(async (req, res) => {
  try {
    const {
      title,
      description,
      responsibilities,
      mode,
      department,
      perks,
      whoshouldapply,
      employementtype,
      noofapplicants
    } = req.body;

    if (
      !title ||
      !description ||
      !responsibilities ||
      !mode ||
      !department ||
      !perks ||
      !whoshouldapply ||
      !employementtype ||
      !noofapplicants
    ) {
      throw new Apierror(400,"Please fill all the required Fields")
    }

    const job = await Job.create({
      title,
      description,
      responsibilities,
      mode,
      department,
      perks,
      whoshouldapply,
      employementtype,
      noofapplicants
    });

     res.status(201)
     .json(new Apiresponse(200,"Job Posting Added Successfully",job));
  } catch (error) {
     console.log("Something Went Wrong",error)
  }
});

export const applyForJob = asynchandler(async (req, res) => {
    const {
      name,
      email,
      resumelink,
      linkedin,
      github,
      phonenumber,
      dob,
      gender,
      other,
      jobId,
    } = req.body;

    if (!jobId) {
      throw new Apierror(400,"Please fill all the required fields")
    }

    if (!name || !email || !resumelink || !linkedin || !phonenumber) {
      throw new Apierror(400,"Mandatory Fields Empty")
    }

    const job = await Job.findById(jobId);
    if (!job) {
      throw new Apierror(404,"Job Posting Not Found")
    }

    
    const existingApplicant = await Applicant.findOne({ email });
    if (existingApplicant) {
     throw new Apierror(500,"Applicant already exists")
    }

    const applicant = await Applicant.create({
      name,
      email,
      resumelink,
      linkedin,
      github,
      phonenumber,
      dob,
      gender,
      other,
      jobtitle:job.title
    });

    job.applicants.push(applicant._id);
    await job.save();

      const resend = new Resend(process.env.RESEND_API_KEY);
             await resend.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to: [email],
          subject: "Application Submitted Successfully | NoCapCode",
         html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Received</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F4F6F8;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:48px 16px;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="
    max-width:640px;
    background:#FFFFFF;
    border-radius:12px;
    box-shadow:0 12px 32px rgba(0,0,0,0.08);
    overflow:hidden;
  ">

    <!-- Header -->
    <tr>
      <td style="
        padding:32px;
        background:#0F1115;
        text-align:center;
      ">
        <img
          src="https://nocapcode.cloud/Companylogo.png"
          alt="NoCapCode"
          width="125"
          style="display:block; margin:0 auto 12px;"
        />

        <h1 style="
          margin:0;
          font-size:20px;
          font-weight:600;
          color:#FFFFFF;
          letter-spacing:0.3px;
        ">
          Application Received
        </h1>

        <p style="
          margin:8px 0 0;
          font-size:12px;
          color:#B6BBC7;
        ">
          NoCapCode™ · Talent Acquisition
        </p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding:36px; color:#1F2937;">

        <!-- Greeting -->
        <p style="margin:0 0 18px; font-size:14.5px;">
          Dear <strong>${name.split(" ")[0]}</strong>,
        </p>

        <!-- Confirmation -->
        <p style="margin:0 0 18px; font-size:14.5px; line-height:1.7;">
          Thank you for your interest in opportunities at <strong>NoCapCode™</strong>.
          This email is to confirm that we have received your application for the
          <strong>${job.department}</strong> position.
        </p>

        <!-- Application Type -->
        <p style="margin:0 0 18px; font-size:14.5px; line-height:1.7;">
          <strong>Application Type:</strong> ${job.employementtype}
        </p>

        <!-- Review Process -->
        <p style="margin:0 0 18px; font-size:14.5px; line-height:1.7;">
          Due to the volume of applications we receive, our Talent Acquisition team
          carefully reviews each profile against role requirements.
          If your qualifications and experience align with our current needs,
          a member of our team will contact you regarding the next steps.
        </p>

        <!-- Next Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          background:#F9FAFB;
          border-radius:10px;
          padding:20px;
          border:1px solid #E5E7EB;
        ">
          <tr>
            <td>
              <p style="margin:0 0 10px; font-size:13px; font-weight:600;">
                What happens next
              </p>
              <ul style="margin:0; padding-left:18px; font-size:13.5px; line-height:1.7;">
                <li>Your application will be reviewed by our Talent Acquisition team</li>
                <li>Shortlisted candidates will be contacted via email</li>
                <li>Review timelines may vary depending on the role and application volume</li>
              </ul>
            </td>
          </tr>
        </table>

        <!-- Closing -->
        <p style="margin:22px 0 0; font-size:14px; line-height:1.7;">
          We appreciate the time and effort you have taken to apply and
          your interest in NoCapCode™.
        </p>

        <p style="margin:18px 0 0; font-size:14px;">
          Sincerely,<br/>
          <strong>Talent Acquisition Team</strong><br/>
          NoCapCode™
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="
        padding:24px 32px;
        background:#F9FAFB;
        border-top:1px solid #E5E7EB;
        text-align:center;
      ">
        <p style="margin:0; font-size:11.5px; color:#6B7280; line-height:1.6;">
          This is a system-generated email. Please do not reply to this message.
          <br/>
          Only shortlisted candidates will be contacted for further communication.
          <br/><br/>
          <strong>NoCapCode™</strong> · Talent Acquisition & Careers
        </p>
      </td>
    </tr>

  </table>

  <p style="margin-top:22px; font-size:11px; color:#9CA3AF; text-align:center;">
    This email contains confidential information intended solely for the recipient.
  </p>

</td>
</tr>
</table>

</body>
</html>
      `
        });

    res.status(201)
    .json(new Apiresponse(200,"Applicant applied Successfully"));
});


export const getAllJobs = asynchandler(async (req, res) => {
  
    const jobs = await Job.find();

    res.status(200)
    .json(new Apiresponse(201,"All job Fetched Successfully",jobs))
});


export const getJobApplicants = asynchandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("applicants");

    if (!job) {
      throw new Apierror(404,"No Job Opening Found")
    }

    res.status(200
        .json(new Apiresponse(201,"Applicants fetched Successfully",job.applicants))
    )
  } catch (error) {
    console.log("Something Went Wrong",error)
  }
});

export const addcasestudy = asynchandler(async(req,res)=>{
  const{head,subhead,content}=req.body;
  

  if(!head ||!subhead || !content){
    throw new Apierror(400,"Please fill all the required fields")
  }

  let thumbnail = ""

  if (req.files?.thumbnail?.length > 0){
    const upload = await uploadToCloudinary(
              req.files.thumbnail[0].buffer,
              "case-study/thumbnail"
            );
      thumbnail = upload.secure_url
  }

  const casestudy = await Case.create({
    title:head,
    subtitle:subhead,
    thumbnail:thumbnail,
    content:content
  })

  res.status(200)
  .json(new Apiresponse(200,"Case study Added Successfully",casestudy))
})

export const getcasestudy = asynchandler(async(req,res)=>{
  const casestudy = await Case.find()

  if(!casestudy.length){
    throw new Apierror(404,"No Case Study Found")
  }

  res.status(200)
  .json(new Apiresponse(201,"Case Study Fetched Successfully",casestudy))
})



export const adminlogin = asynchandler(async (req, res) => {

  const { userid, password } = req.body;

  if (!userid || !password) {
    throw new Apierror(400, "Please fill all the required Details");
  }

  if (
    userid === process.env.ADMIN_LOGIN_ID &&
    password === process.env.ADMIN_PASSWORD
  ) {

    const token = jwt.sign(
      {
        role: "admin",
        userid
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    const options = {
    httpOnly:true,
    secure:true,
    sameSite:"None",
    maxAge:9*60*60*1000
  }


    return res.status(200)
    .cookie("token",token,options)
    .json(
      new Apiresponse(200, "Login Successful", {
        token
      })
    );

  } else {
    throw new Apierror(401, "Unauthorized Access");
  }
});

export const contactus = asynchandler(async(req,res)=>{
  const{name,email,message}=req.body

  if(!name || !email ||!message){
    throw new Apierror(400,"Please fill all the required fields")
  }

   const resend = new Resend(process.env.RESEND_API_KEY);
             await resend.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to: [email],
          subject: "Application Submitted Successfully | NoCapCode",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>We've Received Your Message</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F4F6F8;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:48px 16px;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="
    max-width:640px;
    background:#FFFFFF;
    border-radius:12px;
    box-shadow:0 12px 32px rgba(0,0,0,0.08);
    overflow:hidden;
  ">

    <!-- Header -->
    <tr>
      <td style="
        padding:32px;
        background:#0F1115;
        text-align:center;
      ">
        <img
          src="https://nocapcode.cloud/Companylogo.png"
          alt="NoCapCode"
          width="125"
          style="display:block; margin:0 auto 12px;"
        />

        <h1 style="
          margin:0;
          font-size:20px;
          font-weight:600;
          color:#FFFFFF;
          letter-spacing:0.3px;
        ">
          We've Received Your Message
        </h1>

        <p style="
          margin:8px 0 0;
          font-size:12px;
          color:#B6BBC7;
        ">
          NoCapCode™ · Building with Clarity
        </p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding:36px; color:#1F2937;">

        <!-- Greeting -->
        <p style="margin:0 0 18px; font-size:14.5px;">
          Hey <strong>${name ? name.split(" ")[0] : "there"}</strong>,
        </p>

        <!-- Confirmation -->
        <p style="margin:0 0 18px; font-size:14.5px; line-height:1.7;">
          Thanks for reaching out to <strong>NoCapCode</strong>. 
          We’ve successfully received your message and our team is reviewing it.
        </p>

        <!-- Message Summary Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          background:#F9FAFB;
          border-radius:10px;
          padding:20px;
          border:1px solid #E5E7EB;
        ">
          <tr>
            <td>
              <p style="margin:0 0 10px; font-size:13px; font-weight:600;">
                Here’s what you submitted:
              </p>
              <p style="margin:0; font-size:13.5px; line-height:1.7; color:#374151;">
                "${message}"
              </p>
            </td>
          </tr>
        </table>

        <!-- Response Expectation -->
        <p style="margin:22px 0 0; font-size:14px; line-height:1.7;">
          Our team typically responds within <strong>24-48 hours</strong>. 
          If your request is urgent, feel free to email us directly at 
          <a href="mailto:hello@nocapcode.cloud" style="color:#4F46E5; text-decoration:none;">
            hello@nocapcode.cloud
          </a>.
        </p>

        <!-- Closing -->
        <p style="margin:18px 0 0; font-size:14px;">
          Appreciate you connecting with us.<br/>
          <strong>NoCapCode Team</strong>
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="
        padding:24px 32px;
        background:#F9FAFB;
        border-top:1px solid #E5E7EB;
        text-align:center;
      ">
        <p style="margin:0; font-size:11.5px; color:#6B7280; line-height:1.6;">
          This is an automated confirmation email.
          <br/>
          We’ll personally respond to your inquiry shortly.
          <br/><br/>
          <strong>NoCapCode™</strong> 
          <br>402 N Guadalupe St, Santa Fe, NM 87501, United States
        </p>
      </td>
    </tr>

  </table>

  <p style="margin-top:22px; font-size:11px; color:#9CA3AF; text-align:center;">
    © 2026 NoCapCode™. All rights reserved.
  </p>

</td>
</tr>
</table>

</body>
</html>
          `
        });

 const resend1 = new Resend(process.env.RESEND_API_KEY);
             await resend1.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to:  [process.env.SMTP_USER],
          subject: "Contact Us - Notification | NoCapCode",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Contact Us - Notification | NoCapCode</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F4F6F8;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 16px;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="
    max-width:680px;
    background:#FFFFFF;
    border-radius:12px;
    box-shadow:0 12px 32px rgba(0,0,0,0.08);
    overflow:hidden;
  ">

    <!-- Header -->
    <tr>
      <td style="
        padding:28px 32px;
        background:#0F1115;
      ">
        <h2 style="
          margin:0;
          color:#FFFFFF;
          font-size:18px;
          font-weight:600;
        ">
          New Contact Form Submission
        </h2>

        <p style="
          margin:6px 0 0;
          color:#B6BBC7;
          font-size:12px;
        ">
          NoCapCode™ Website
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px; color:#1F2937;">

        <p style="margin:0 0 20px; font-size:14px;">
          A new message has been submitted through the <strong>Contact Us</strong> page.
        </p>

        <!-- Info Table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          border-collapse:collapse;
          font-size:14px;
        ">
          <tr>
            <td style="padding:12px; border:1px solid #E5E7EB; background:#F9FAFB; width:150px;">
              <strong>Name</strong>
            </td>
            <td style="padding:12px; border:1px solid #E5E7EB;">
              ${name}
            </td>
          </tr>

          <tr>
            <td style="padding:12px; border:1px solid #E5E7EB; background:#F9FAFB;">
              <strong>Email</strong>
            </td>
            <td style="padding:12px; border:1px solid #E5E7EB;">
              <a href="mailto:${email}" style="color:#4F46E5; text-decoration:none;">
                ${email}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:12px; border:1px solid #E5E7EB; background:#F9FAFB; vertical-align:top;">
              <strong>Message</strong>
            </td>
            <td style="padding:12px; border:1px solid #E5E7EB; line-height:1.6;">
              ${message}
            </td>
          </tr>
        </table>

        <!-- Action Reminder -->
        <p style="margin:24px 0 0; font-size:13px; color:#6B7280;">
          Please respond to the inquiry within 24 hours to maintain a strong client experience.
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="
        padding:20px 32px;
        background:#F9FAFB;
        border-top:1px solid #E5E7EB;
        text-align:center;
      ">
        <p style="margin:0; font-size:11.5px; color:#9CA3AF;">
          This is an automated notification from NoCapCode™ website.
        </p>
      </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>
          `
        });


res.status(200)
.json(new Apiresponse(201,"Contact us completed"))


})

export const clarity = asynchandler(async(req,res)=>{
  const{clarityresponse}=req.body

  if(!clarityresponse){
    throw new Apierror(400,"Please fill all the required fields")
  }

   const resend2 = new Resend(process.env.RESEND_API_KEY);
             await resend2.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to: [clarityresponse[1].answer],
          subject: "Application Submitted Successfully | NoCapCode",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Clarity Responses Received</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F4F6F8;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:48px 16px;">

  <!-- Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="
    max-width:640px;
    background:#FFFFFF;
    border-radius:12px;
    box-shadow:0 12px 32px rgba(0,0,0,0.08);
    overflow:hidden;
  ">

    <!-- Header -->
    <tr>
      <td style="
        padding:32px;
        background:#0F1115;
        text-align:center;
      ">
        <img
          src="https://nocapcode.cloud/Companylogo.png"
          alt="NoCapCode"
          width="125"
          style="display:block; margin:0 auto 12px;"
        />

        <h1 style="
          margin:0;
          font-size:20px;
          font-weight:600;
          color:#FFFFFF;
          letter-spacing:0.3px;
        ">
          Clarity Responses Received
        </h1>

        <p style="
          margin:8px 0 0;
          font-size:12px;
          color:#B6BBC7;
        ">
          NoCapCode™ · Start with Clarity
        </p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding:36px; color:#1F2937;">

        <!-- Greeting -->
        <p style="margin:0 0 18px; font-size:14.5px;">
          Hey <strong>${clarityresponse[0].answer}</strong>,
        </p>

        <!-- Confirmation -->
        <p style="margin:0 0 18px; font-size:14.5px; line-height:1.7;">
          Thank you for taking the time to complete the <strong>Clarity Questions</strong>.
          We’ve successfully received your responses.
        </p>

        <!-- Review Process -->
        <p style="margin:0 0 18px; font-size:14.5px; line-height:1.7;">
          Our leadership and MVPs team is currently reviewing your inputs to understand
          your goals, context, and what success looks like for you.
        </p>

        <!-- Next Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          background:#F9FAFB;
          border-radius:10px;
          padding:20px;
          border:1px solid #E5E7EB;
        ">
          <tr>
            <td>
              <p style="margin:0 0 10px; font-size:13px; font-weight:600;">
                What happens next
              </p>
              <ul style="margin:0; padding-left:18px; font-size:13.5px; line-height:1.7;">
                <li>Your Clarity responses are reviewed internally</li>
                <li>A member of our leadership or MVPs team may reach out</li>
                <li>You’ll hear from us if there’s a clear next step to explore</li>
              </ul>
            </td>
          </tr>
        </table>

        <!-- Closing -->
        <p style="margin:22px 0 0; font-size:14px; line-height:1.7;">
          We appreciate the clarity you shared. It helps us move faster and build with
          intention—not assumptions.
        </p>

        <p style="margin:18px 0 0; font-size:14px;">
          Warm regards,<br/>
          <strong>Leadership & MVPs Team</strong><br/>
          NoCapCode™
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="
        padding:24px 32px;
        background:#F9FAFB;
        border-top:1px solid #E5E7EB;
        text-align:center;
      ">
        <p style="margin:0; font-size:11.5px; color:#6B7280; line-height:1.6;">
          This is a system-generated email. Please do not reply to this message.
          <br/>
          Our team will contact you if further discussion is required.
          <br/><br/>
          <strong>NoCapCode™</strong> · Built with Clarity
        </p>
      </td>
    </tr>

  </table>

  <p style="margin-top:22px; font-size:11px; color:#9CA3AF; text-align:center;">
    This email contains confidential information intended solely for the recipient.
  </p>

</td>
</tr>
</table>

</body>
</html>
          `
        });

 const resend1 = new Resend(process.env.RESEND_API_KEY);
             await resend1.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to:  [process.env.SMTP_USER],
          subject: "Clarity Question - Notification | NoCapCode",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Clarity Submission | NoCapCode</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F4F6F8;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 16px;">

<table width="100%" cellpadding="0" cellspacing="0" style="
  max-width:720px;
  background:#FFFFFF;
  border-radius:12px;
  box-shadow:0 12px 32px rgba(0,0,0,0.08);
  overflow:hidden;
">

<tr>
<td style="
  padding:36px 32px;
  background:#0F1115;
  text-align:center;
">
<img
  src="https://nocapcode.cloud/Companylogo.png"
  alt="NoCapCode"
  width="130"
  style="display:block; margin:0 auto 18px;"
/>

<h2 style="
  margin:0;
  color:#FFFFFF;
  font-size:20px;
  font-weight:600;
">
  New Clarity Form Submission
</h2>

<p style="
  margin:8px 0 0;
  color:#B6BBC7;
  font-size:12px;
">
  NoCapCode™ · Start with Clarity
</p>

</td>
</tr>

<tr>
<td style="padding:32px; color:#1F2937;">

<p style="margin:0 0 24px; font-size:14px;">
A new clarity submission has been received. Details are below:
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="
  border-collapse:collapse;
  font-size:14px;
">

${clarityresponse.map((item, index) => `
<tr>
  <td style="padding:12px; border:1px solid #E5E7EB; background:#F9FAFB; vertical-align:top;">
    <strong>${index + 1}. ${item.question}</strong>
  </td>
  <td style="padding:12px; border:1px solid #E5E7EB; line-height:1.6;">
    ${item.answer || "—"}
  </td>
</tr>
`).join("")}

</table>

<p style="margin:24px 0 0; font-size:13px; color:#6B7280;">
Please review and determine next steps for qualification and follow-up.
</p>

</td>
</tr>

<tr>
<td style="
  padding:22px 32px;
  background:#F9FAFB;
  border-top:1px solid #E5E7EB;
  text-align:center;
">
<p style="margin:0; font-size:11.5px; color:#9CA3AF;">
Automated notification from NoCapCode™ Clarity Form.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
          `
        });


res.status(200)
.json(new Apiresponse(201,"Clarity Form completed"))


})

export const credentialverify = asynchandler(async(req,res)=>{
  const{credid, content} = req.body

  if(!credid){
    throw new Apierror(400,"Please fill all the required fields")
  }

  const employee = await Employee.findById(credid)

  if(!employee){
    throw new Apierror(400,"Employee not found")
  }

  let certificate = ""

  if (req.files?.certificate?.length > 0){
    const upload = await uploadToCloudinary(
              req.files.certificate[0].buffer,
              `${employee.name}/certificate`
            );
      certificate = upload.secure_url
  }


    employee.completioncertificate = certificate
    employee.endAt = Date.now()
    employee.acknowledge = content
    await employee.save({validateBeforeSave:false})
  

 const start = new Date(employee.startedAt);
const end = new Date(employee.endAt);

const duration =
  (end.getFullYear() - start.getFullYear()) * 12 +
  (end.getMonth() - start.getMonth());

  const resend2 = new Resend(process.env.RESEND_API_KEY);
             await resend2.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to: [employee.Emails.email],
          subject: "Internship Completion Cetificate | NoCapCode",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Internship Completion Certificate | NoCapCode</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#F4F6F8;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 16px;">

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="
    max-width:720px;
    background:#FFFFFF;
    border-radius:12px;
    box-shadow:0 12px 32px rgba(0,0,0,0.08);
    overflow:hidden;
  ">

    <!-- Header -->
    <tr>
      <td style="
        padding:40px 32px;
        background:#0F1115;
        text-align:center;
      ">
        
        <img
          src="https://nocapcode.cloud/internal/Companylogo.png"
          alt="NoCapCode"
          width="140"
          style="display:block; margin:0 auto 18px;"
        />

        <h2 style="
          margin:0;
          color:#FFFFFF;
          font-size:22px;
          font-weight:600;
          letter-spacing:0.4px;
        ">
          Internship Completion Certificate
        </h2>

        <p style="
          margin:10px 0 0;
          color:#B6BBC7;
          font-size:12px;
          letter-spacing:0.5px;
        ">
          NoCapCode™ · Build with Clarity
        </p>

      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:36px 32px; color:#1F2937;">

        <p style="margin:0 0 18px; font-size:15px;">
          Dear <strong>${employee.name}</strong>,
        </p>

        <p style="margin:0 0 16px; font-size:14px; line-height:1.7;">
          We are pleased to formally recognize the successful completion of your internship as 
          <strong>${employee.role}</strong> at <strong>NoCapCode™</strong> for the duration of 
          <strong>${duration} months</strong>.
        </p>

        <p style="margin:0 0 16px; font-size:14px; line-height:1.7;">
          Throughout your time with us, you demonstrated professionalism, ownership, and a strong 
          willingness to learn. Your contributions consistently reflected clarity in execution, 
          accountability in responsibilities, and a meaningful commitment to team success.
        </p>

        <p style="margin:0 0 24px; font-size:14px; line-height:1.7;">
          We sincerely appreciate the dedication and positive energy you brought into the organization. 
          It has been a pleasure having you as part of our team, and we trust that this experience 
          has added meaningful value to your professional journey.
        </p>

        <!-- Certificate Preview -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
          <tr>
            <td align="center">
              <img
                src=${employee.completioncertificate}
                alt="Internship Certificate Preview"
                width="420"
                style="max-width:100%; border-radius:8px; border:1px solid #E5E7EB;"
              />
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 10px;">
          <tr>
            <td align="center">
              <a href="https://nocapcode.cloud/verify/certificate/${employee._id}" 
                 style="
                   display:inline-block;
                   padding:14px 28px;
                   background:#4F46E5;
                   color:#FFFFFF;
                   font-size:14px;
                   font-weight:600;
                   text-decoration:none;
                   border-radius:8px;
                   letter-spacing:0.3px;
                 ">
                 Access & Download Your Official Certificate
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:18px 0 0; font-size:13px; color:#6B7280; line-height:1.6;">
          Your certificate is securely verifiable through our official verification portal. 
          We encourage you to share it proudly across your professional platforms.
        </p>

        <p style="margin:24px 0 0; font-size:14px;">
          Wishing you continued success in your future endeavors.
        </p>

        <p style="margin:16px 0 0; font-size:14px;">
          Warm regards,<br/>
          <strong>Talent Acquisition & HR Team</strong><br/>
          NoCapCode™
        </p>

      </td>
    </tr>


<!-- Footer -->
<table width="100%" cellpadding="0" cellspacing="0" style="
  margin-top:24px;
  background:#F9FAFB;
  border-top:1px solid #E5E7EB;
">
  <tr>
    <td align="center" style="padding:28px 24px;">

      <!-- Support -->
      <p style="
        margin:0 0 12px;
        font-size:13px;
        color:#6B7280;
        line-height:1.7;
      ">
        Questions regarding your certificate or verification?<br>
        Contact our Talent Acquisition &amp; HR Team at
        <a
          href="mailto:hr@nocapcode.cloud"
          style="
            color:#4F46E5;
            text-decoration:none;
            font-weight:600;
          "
        >
          hr@nocapcode.cloud
        </a>
      </p>

      <!-- LinkedIn -->
      <p style="padding-bottom:12px;">
      <a href="https://www.linkedin.com/company/nocapcode" target="_blank" style="text-decoration:none;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#777777">
        <path d="M20.447 20.452H16.893V14.847C16.893 13.522 16.868 11.813 15.049 11.813C13.205 11.813 12.923 13.248 12.923 14.754V20.452H9.368V9H12.782V10.561H12.829C13.306 9.659 14.468 8.707 16.221 8.707C19.897 8.707 20.447 11.07 20.447 14.138V20.452ZM5.337 7.433C4.196 7.433 3.27 6.507 3.27 5.367C3.27 4.227 4.196 3.301 5.337 3.301C6.477 3.301 7.403 4.227 7.403 5.367C7.403 6.507 6.477 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452Z" />
      </svg>
      </p>

        <!-- Quick Links -->
        <p style="
          margin:0 0 18px;
          font-size:12px;
          color:#6B7280;
        ">
          <a
            href="https://nocapcode.cloud/privacy"
            target="_blank"
            style="color:#6B7280; text-decoration:none;"
          >
            Privacy Policy
          </a>
          &nbsp;|&nbsp;
          <a
            href="https://nocapcode.cloud/terms"
            target="_blank"
            style="color:#6B7280; text-decoration:none;"
          >
            Terms of Service
          </a>
          &nbsp;|&nbsp;
          <a
            href="https://nocapcode.cloud/security"
            target="_blank"
            style="color:#6B7280; text-decoration:none;"
          >
            Security
          </a>
        </p>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="border-top:1px solid #E5E7EB; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>
        </table>

        <!-- Footer Text -->
        <p style="
          margin:16px 0 6px;
          font-size:11px;
          color:#9CA3AF;
          line-height:1.7;
        ">
          This communication was issued by the NoCapCode™ Talent Acquisition &amp; Human Resources Department.
        </p>

        <p style="
          margin:0 0 6px;
          font-size:11px;
          color:#9CA3AF;
          line-height:1.7;
        ">
          Certificate Verification:
          <a
            href="https://nocapcode.cloud/verify/certificate/${employee._id}"
            target="_blank"
            style="
              color:#4F46E5;
              text-decoration:none;
              font-weight:500;
            "
          >
            nocapcode.cloud/verify/certificate/${employee._id}
          </a>
        </p>

        <p style="
          margin:0;
          font-size:11px;
          color:#9CA3AF;
          line-height:1.7;
        ">
          © 2026 NoCapCode Inc. All Rights Reserved.<br>
        </p>

      </td>
    </tr>
  </table>

  </table>

</td>
</tr>
</table>

</body>
</html>
          `
        });

  res.status(200)
  .json(new Apiresponse(200,"Certificate saved successfully"))



})

export const verify = asynchandler(async(req,res)=>{
  const {credid} = req.params
  console.log(credid)
  

  if(!credid){
    throw new Apierror(400,"Please fill all the required fields")
  }

 const employee =  await Employee.findById(credid)
 console.log(employee._id)

  if(!employee){
    throw new Apierror(400,"Employee not found")
  }

  res.status(200)
  .json(new Apiresponse(200,"Details fetched Successfully",employee))
  
  
})

export const allemployees = asynchandler(async(req,res)=>{
  const employees = await Employee.find();
  if(!employees){
    throw new Apierror(400,"User not found")
  }
  res.status(200)
  .json(new Apiresponse(200,"User Fetched Successfully",employees))
})



export const seedSpaceForm = asynchandler(async(req,res)=>{

  const{businessName,name,phone,email,teamSize}=req.body

  if(!businessName || !name || !phone || !email || !teamSize){
    throw new Apierror(400,"Please fill all the required fields")
  }
  const details = await SeedSpace.create({
    businessName, name, phone, email, teamSize
  })


   const resend = new Resend(process.env.RESEND_API_KEY);
             await resend.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to: [email],
          subject: "Your SeedSpace application is under review!",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Received - SeedSpace</title>
</head>

<body style="margin:0; padding:0; background:#0F0F0F; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;">
  <tr>
    <td align="center" style="padding:48px 16px;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#000000; border-radius:12px; border: 1px solid #333333; box-shadow: 0 4px 24px rgba(0,0,0,0.5); overflow:hidden;">
        
        <tr>
          <td style="padding:48px 32px 20px; text-align:center;">
            <img src="https://nocapcode.cloud/seedspace/logo.png" alt="SeedSpace" height="50" style="display:block; margin:0 auto 16px;" />
            <p style="margin:16px 0 0; font-size:14px; color:#A1A1AA; font-weight: 400; letter-spacing: 0.3px;">
              A selective initiative for start-ups and early-stage founders
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:10px 36px 40px; color:#E5E7EB;">

            <hr style="border:none; border-top:1px solid #27272A; margin-bottom: 30px;">

            <p style="margin:0 0 18px; font-size:15px; color:#FFFFFF;">
              Hi <strong>${name}</strong>,
            </p>

            <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#D4D4D8;">
              Thank you for applying to SeedSpace with <strong>${businessName}</strong>. We have successfully received your application.
            </p>

            <p style="margin:0 0 28px; font-size:15px; line-height:1.7; color:#D4D4D8;">
              We review every application carefully to ensure we're the right fit before moving forward. Our team will now evaluate your submission.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111; border-left: 3px solid #E5E7EB; border-radius:4px; padding:24px;">
              <tr>
                <td>
                  <p style="margin:0; font-size:14.5px; line-height:1.6; color:#F4F4F5;">
                    <strong style="color:#FFFFFF;">What's next?</strong><br>
                    Once our evaluation is complete, we will connect with you within <strong style="color:#FFFFFF;">4-7 Business Days</strong> regarding the status of your application.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:36px 0 0; font-size:15px; color:#A1A1AA;">
              Best regards,<br/>
              <span style="color:#FFFFFF; font-weight:500;">The SeedSpace Team</span>
            </p>

          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin-top:20px; text-align:center; color:#777777; font-size:12px; line-height: 1.6;">
        <tr>
          <td style="padding:20px 20px 10px 20px;">
            If you have any questions, contact us at
            <a href="mailto:operations@nocapcode.cloud" style="color:#A1A1AA; text-decoration:underline;">
              operations@nocapcode.cloud
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:12px;">
            <a href="https://www.linkedin.com/company/nocapcode" target="_blank" style="text-decoration:none;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#777777">
                <path d="M20.447 20.452H16.893V14.847C16.893 13.522 16.868 11.813 15.049 11.813C13.205 11.813 12.923 13.248 12.923 14.754V20.452H9.368V9H12.782V10.561H12.829C13.306 9.659 14.468 8.707 16.221 8.707C19.897 8.707 20.447 11.07 20.447 14.138V20.452ZM5.337 7.433C4.196 7.433 3.27 6.507 3.27 5.367C3.27 4.227 4.196 3.301 5.337 3.301C6.477 3.301 7.403 4.227 7.403 5.367C7.403 6.507 6.477 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452Z" />
              </svg>
            </a>
          </td>
        </tr>
        
        <tr>
          <td style="padding-bottom:6px;">
            <a href="https://nocapcode.cloud" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Home</a> |
            <a href="https://nocapcode.cloud/services" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Services</a> |
            <a href="https://nocapcode.cloud/about" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">About</a> |
            <a href="https://nocapcode.cloud/contact" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Contact</a>
          </td>
        </tr>

        <tr>
          <td style="padding-bottom:12px;">
            <a href="https://nocapcode.cloud/privacy" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Privacy</a> |
            <a href="https://nocapcode.cloud/terms" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Terms</a> |
            <a href="https://nocapcode.cloud/security" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Security</a>
          </td>
        </tr>

        <tr>
          <td style="padding-top:10px; border-top: 1px solid #222222; color:#555555;">
            &copy; 2024-26 NoCapCode, Inc. All rights reserved.<br>
            Santa Fe ・ New Mexico 87501, USA
            <br><br>
            <span style="font-size: 10px; color:#555555;">
              You are receiving this email because you submitted an application to the SeedSpace™ initiative. <br>
              To stop receiving these automated messages, you can <a href="#" style="color:#777777; text-decoration:underline;">unsubscribe here</a>.
            </span>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>
          `
        });

 const resend1 = new Resend(process.env.RESEND_API_KEY);
             await resend1.emails.send({
          from: `NoCapCode <${process.env.SMTP_USER}>`,
          to:  [process.env.SMTP_USER],
          subject: "New SeedSpace Application Received",
          html:`
          <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New SeedSpace Application</title>
</head>

<body style="margin:0; padding:0; background:#0F0F0F; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;">
  <tr>
    <td align="center" style="padding:48px 16px;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#000000; border-radius:12px; border:1px solid #333333; box-shadow:0 4px 24px rgba(0,0,0,0.5); overflow:hidden;">
        
        <tr>
          <td style="padding:40px 32px 30px; background:#000000; text-align:center; border-bottom: 1px solid #333333;">
            <img src="https://nocapcode.cloud/seedspace/logo.png" alt="SeedSpace" height="40" style="display:block; margin:0 auto 16px;" />
            <h1 style="margin:0; font-size:20px; font-weight:400; color:#FFFFFF; letter-spacing:0.5px;">
              New Application Received
            </h1>
          </td>
        </tr>

        <tr>
          <td style="padding:36px; color:#E5E7EB;">
            <p style="margin:0 0 24px; font-size:15px; color:#A1A1AA;">
              A new application has been submitted for the SeedSpace initiative. Here are the details:
            </p>

            <table width="100%" cellpadding="14" cellspacing="0" style="background:#111111; border-radius:8px; border:1px solid #333333; font-size:14px;">
              <tr>
                <td style="width:40%; font-weight:600; border-bottom:1px solid #333333; color:#FFFFFF;">Business Name:</td>
                <td style="width:60%; border-bottom:1px solid #333333; color:#D4D4D8;">${businessName}</td>
              </tr>
              <tr>
                <td style="font-weight:600; border-bottom:1px solid #333333; color:#FFFFFF;">Owner Name:</td>
                <td style="border-bottom:1px solid #333333; color:#D4D4D8;">${name}</td>
              </tr>
              <tr>
                <td style="font-weight:600; border-bottom:1px solid #333333; color:#FFFFFF;">Phone Number:</td>
                <td style="border-bottom:1px solid #333333; color:#D4D4D8;">${phone}</td>
              </tr>
              <tr>
                <td style="font-weight:600; border-bottom:1px solid #333333; color:#FFFFFF;">Email Address:</td>
                <td style="border-bottom:1px solid #333333;">
                  <a href="mailto:{email}" style="color:#E5E7EB; text-decoration:underline;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="font-weight:600; color:#FFFFFF;">Current Team Size:</td>
                <td style="color:#D4D4D8;">${teamSize}</td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin-top:20px; text-align:center; color:#777777; font-size:12px; line-height: 1.6;">
        <tr>
          <td style="padding:20px 20px 10px 20px;">
            If you have any questions, contact us at
            <a href="mailto:operations@nocapcode.cloud" style="color:#A1A1AA; text-decoration:underline;">
              operations@nocapcode.cloud
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:12px;">
            <a href="https://www.linkedin.com/company/nocapcode" target="_blank" style="text-decoration:none;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#777777">
                <path d="M20.447 20.452H16.893V14.847C16.893 13.522 16.868 11.813 15.049 11.813C13.205 11.813 12.923 13.248 12.923 14.754V20.452H9.368V9H12.782V10.561H12.829C13.306 9.659 14.468 8.707 16.221 8.707C19.897 8.707 20.447 11.07 20.447 14.138V20.452ZM5.337 7.433C4.196 7.433 3.27 6.507 3.27 5.367C3.27 4.227 4.196 3.301 5.337 3.301C6.477 3.301 7.403 4.227 7.403 5.367C7.403 6.507 6.477 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452Z" />
              </svg>
            </a>
          </td>
        </tr>
        
        <tr>
          <td style="padding-bottom:6px;">
            <a href="https://nocapcode.cloud" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Home</a> |
            <a href="https://nocapcode.cloud/services" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Services</a> |
            <a href="https://nocapcode.cloud/about" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">About</a> |
            <a href="https://nocapcode.cloud/contact" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Contact</a>
          </td>
        </tr>

        <tr>
          <td style="padding-bottom:12px;">
            <a href="https://nocapcode.cloud/privacy" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Privacy</a> |
            <a href="https://nocapcode.cloud/terms" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Terms</a> |
            <a href="https://nocapcode.cloud/security" target="_blank" style="color:#777777; text-decoration:none; margin:0 6px;">Security</a>
          </td>
        </tr>

        <tr>
          <td style="padding-top:10px; border-top: 1px solid #222222; color:#555555;">
            &copy; 2024-26 NoCapCode, Inc. All rights reserved.<br>
            Santa Fe ・ New Mexico 87501, USA
            <br><br>
            <span style="font-size: 10px; color:#444444; text-transform: uppercase;">Confidentiality Notice: This email and any attachments contain confidential applicant information.<br>Do not forward or distribute outside the organization.</span>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>
          `
        });


res.status(200)
.json(new Apiresponse(201,"Contact us completed"))

})
