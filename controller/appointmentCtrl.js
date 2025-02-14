const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const Client = require("../models/clientModel");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs")
const createLog = require("../utils/loggerCtrl");


// creates appointment and lists the appointmens to the user appointments array

const createAppointment = asyncHandler(async (req, res) => {
  const {interpreter, client, email, address, phone, date, time, note, location } = req.body;  
  console.log(interpreter)
  try {
    const clientId = await User.findById(req.body.client);
    console.log(clientId)
    const interpreterId = await User.findById(req.body.interpreter)
    console.log(interpreterId)
    const staffId = await User.findById(req.body.staff)
    if (!clientId) {
      createLog(req.user._id, "Create appointment attempt", "failed", `Create appointment attempt failed to ${req.user.username}`);
      return res.status(400).json({error:"Client not found"});
    }
    if (!interpreterId) {
      createLog(req.user._id, "Create appointment attempt", "failed", `Create appointment attempt failed to ${req.user.username}`);
      return res.status(400).json({error:"Interpreter not found"});
    }
    if (!staffId) {
      createLog(req.user._id, "Create appointment attempt", "failed", `Create appointment attempt failed to ${req.user.username}`);
      return res.status(400).json({error:"Staff not found"});
    }
    const newAppointment = new Appointment({
      ...req.body,
      createdBy:req.user,
    });
   
    newAppointment.save();

    clientId.appointments.push(newAppointment._id);
    interpreterId.appointments.push(newAppointment._id);
    staffId.appointments.push(newAppointment._id);

    await clientId.save();
    await interpreterId.save();
    await staffId.save();

    createLog(req.user._id, "Create appointment attempt", "success", `${req.user.username} created a new appointment for ${clientId.username}, ${interpreterId.username} & ${staffId.username}`);
    res.status(200).json({
      message:"Appointment successfully created", 
      appointment:newAppointment});
  } catch (error) {
    // throw new Error(error)
    createLog(req.user._id, "Create appointment attempt", "failed", `Create appointment attempt failed to ${req.user.username}`);
    res.status(400).json({message:"Error creating appointment", error:error.message});
  }
});

// total appoinments to be seen by the super admin and company admin
const totalAppointments = asyncHandler(async (req, res) => {
  const user = req.user;
  try {
    if (user.role === "admin") {
      const appointments = await Appointment.countDocuments();
      res.status(200).json({ total: appointments });
    } else if (user.role === "company_admin") {
      console.log(user)
      const appointments = await Appointment.countDocuments({createdBy:user});
      res.status(200).json({ total: appointments });
    }
  } catch (err) {
    // throw new Error(error);
    res.status(400).json({message: "Error retrieving total appointments", error:err});

  }
});



// get appointments for client ========================
const getClientAppointments = asyncHandler(async (req, res) => {
  const {id} = req.user;
  console.log(id)
  try {
    const user = await User.findById(id)
    console.log(user)
    if (!user) {
      return res.json({error:"User not found"});
    }
    
    const appointments = await Appointment.find({client:id})
    .populate("interpreter", "username email")
    .populate("client", "username email")
    .sort({date:1});
    res.status(200).json({
      message:`Appointments for ${user.username}`,
      appointments,
    });
    console.log(user)
  } catch (error) {
    res.status(500).json({error: "Error retrieving appointment"});
    // throw new Error(error)
  }
});

// get appointments for interpreter =================================

const getInterpreterAppointments = asyncHandler(async (req, res) => {
  const {id} = req.user;
  console.log(id)
  try {
    const user = await User.findById(id)
    console.log(user)
    if (!user) {
      return res.json({error:"User not found"});
    }
    
    const appointments = await Appointment.find({interpreter:id})
    .populate("interpreter", "username email")
    .populate("client", "username email")
    .sort({date:1});
    res.status(200).json({
      message:`Appointments for ${user.username}`,
      appointments,
    });
    console.log(user)
  } catch (error) {
    res.status(500).json({error: "Error retrieving appointment"});
    // throw new Error(error)
  }
});

// Rate appointment by the client ========================================

const rateAppointment = asyncHandler(async (req, res) => {
    const _id = req.user;
    console.log(_id)
    const { rating, comment, email, appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    console.log(appointment)
    const alreadyRated = appointment.feedback.ratedBy && (appointment.feedback.ratedBy.toString() === _id.toString())
    try {
        if (req.user.id.toString() !== appointment.client.toString()) {
          return res.status(401).json({error:"Not authorized"})
        }
        
        if (alreadyRated) {
          
          return res.status(403).json({error:'Already rated'});
        //   res.json({message:"already rated"});
        } else {
          const rateAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            {
              $set: {
                feedback: {
                  rating: rating,
                  comment: comment,
                  email: email,
                  ratedBy: req.user,
                },
              },
            },
            {
              new: true,
            }
          );
          res.status(201).json(rateAppointment);
        }
    } catch (error) {
      throw new Error(error);
      // res.status(500).json({error: "Error giving feedback"});
    }
});

// api retrieves appointment for the client and interpreter in party ============

const getUpcomingAppointments = asyncHandler(async (req,res) => {
  const user = req.user;
  try {
    if (user.role === 'interpreter') {
      const currentDate = new Date();
      const upcomingAppointments = await Appointment.find({
        interpreter:user.id,
        date:{$gte:currentDate}
      })
    .populate("interpreter", "username email")
    .populate("client", "username")
    .sort("-date");
    res.status(200).json(upcomingAppointments);
    } else if (user.role === 'client') {
      const currentDate = new Date();
      const upcomingAppointments = await Appointment.find({
        client:user.id,
        date:{$gte:currentDate}
      })
    .populate("interpreter", "username email")
    .populate("client", "username")
    .sort("-date");
    res.status(200).json(upcomingAppointments);
    }
    
  } catch (error) {
    // throw new Error(error)
    res.status(400).json({error: "Error retrieving upcoming appointments"});
  }
});

// get past appointment for client and interpreter  =========================

const getPastAppointments = asyncHandler(async (req, res) => {
  const user = req.user;
  try {
    if (user.role === 'interpreter') {
      const currentDate = new Date();
      const pastAppointments = await Appointment.find({
        interpreter:user.id,
        date:{$lt:currentDate}
      })
    .populate("interpreter", "username email")
    .populate("client", "username")
    .sort("-date");
    res.status(200).json(pastAppointments);
    } else if (user.role === 'client') {
      const currentDate = new Date();
      const pastAppointments = await Appointment.find({
        client:user.id,
        date:{$lt:currentDate}
      })
    .populate("interpreter", "username email")
    .populate("client", "username")
    .sort("-date");
    res.status(200).json(pastAppointments);
    }
    
  } catch (error) {
    // throw new Error(error)
    res.status(400).json({error: "Error retrieving upcoming appointments"});
  }
});

// API reschedule appointment for client and interpreter ===========================

const reshAppoint = asyncHandler( async (req, res) => {
  const user = req.user;
  const  { appointmentId }  = req.params;
  console.log({aptId:appointmentId});
  console.log({logedUser:user.id})
  
  const appointment = await Appointment.findById(appointmentId);
  if(!appointment){
    return res.status(404).json({error:"Appointment not found"});
    createLog(user._id, "Attempt to reschedule appointment", "failed", `${user} failed on an attempt to reschedule appointment, appointment not found.`);
  }
  console.log({apptIdInt:appointment});
    if (user.id.toString() === appointment.interpreter.toString()) {
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, req.body, {new:true});
      createLog(user._id, "Attempt to reschedule appointment", "success", `${user.username} resheduled appointment with ID ${appointmentId}.`);
      res.status(200).json({message:"Appointment is successfully rescheduled", 
      rescheduled_appointment:appointment});
    } else if (user.id.toString() === appointment.client.toString()) {
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, req.body, {new:true});
      createLog(user._id, "Attempt to reschedule appointment", "success", `${user.username} resheduled appointment with ID ${appointmentId}.`);
      res.status(200).json({message:"Appointment is successfully rescheduled", 
      rescheduled_appointment:appointment});
    } else {
      createLog(user._id, "Attempt to reschedule appointment", "failed", `${user.username} not a party to reschedule appointment.`);
      res.status(401).json({error:"Not authorized!"})
    }
});

// Mark appointment as complete ===========================================

const markAsComplete = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  
  const {note} = req.body;
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      createLog(req.user._id, "Mark appointment as complete", "failed", `${req.user.username} could not find appointment with ID ${appointmentId}.`);
      return res.status(404).json({error:"Appointment not found"});
    }
    if (appointment.interpreter.toString() !== req.user.toString()) {
      createLog(req.user._id, "Mark appointment as complete", "failed", `${req.user.username} not a party to mark appointment as complete.`);
      return res.status(401).json({error:"Not authorized user to update this appointment"});
    }
    appointment.status = "completed";
    if (note) {
      appointment.note = note
    }
    await appointment.save();
    res.status(200).json({message: "Marked as complete", completed_appointment:appointment});
    createLog(req.user._id, "Mark appointment as complete", "success", `${req.user.username} marked appointment with ID ${appointmentId} as complete.`);
  } catch (error) {
    // throw new Error(error)
    createLog(req.user._id, "Mark appointment as complete", "failed", `${req.user.username} failed in marking appointment, request or parameters not passed correctly.`);
    res.status(400).json({error: "There is an error marking apointment as complete, ID may not be passed properly"});
  }

  
});

const getAppointment = asyncHandler(async(req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findBId(id);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({error:"Error fetching appointment"});
  }
});

// upload a signed agreement form 
const uploadSignedAgreementForm = asyncHandler(async(req, res) => {
  const { id } = req.params;
  try {
    const appointment = Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({error:"Appointment not found"})
    }
    if (appointment.interpreter.toString !== req.user.id.toString()) {
      return res.status(403).json({error: "You are not authorized for this action"});
    }
    appointment.signedAgreementForm = req.file.path;
    await appointment.save();
    res.status(200).json({message:"Signed agreement form uploaded successfully!"})
  } catch (error) {
    res.status(400).json({error:"Error uploading signed agreement form"})
  }
});


const uploadAgreementForm = asyncHandler (async (req, res) => {
  const { appointmentId } = req.params;
  const { formType } = req.body; // Can be 'agreementForm' or 'signedAgreementForm'
  const requesterId = req.user.id; 

  try {
      // Check if the appointment exists
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
          createLog(req.user._id, "Upload agreement / signed agreement form", "failed", `${req.user.username} could not find appointment with ID ${appointmentId}.`);
          return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if the requester is associated with the appointment
      if (appointment.client.toString() !== requesterId && appointment.interpreter.toString() !== requesterId) {
          createLog(req.user._id, "upload agreement / signed agreement form", "failed", `${req.user.username} is not a party on this appointment.`);
          return res.status(403).json({ message: "Unauthorized: You are not part of this appointment" });
      }

      // Check if a file is provided
      if (!req.file) {
          createLog(req.user._id, "upload agreement / signed agreement form", "failed", `${req.user.username} did not submit approriate file`);
          return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate formType
      if (!["agreementForm", "signedAgreementForm"].includes(formType)) {
          createLog(req.user._id, "upload agreement / signed agreement form", "failed", `${req.user.username} did not submit the appropriate form type.`);
          return res.status(400).json({ message: "Invalid formType. Must be 'agreementForm' or 'signedAgreementForm'" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "raw", 
          folder: "agreement_forms", 
      });

      fs.unlinkSync(req.file.path);

      if (formType === "agreementForm") {
          appointment.agreementForm = result.secure_url;
      } else if (formType === "signedAgreementForm") {
          appointment.signedAgreementForm = result.secure_url;
      }
      await appointment.save();
      createLog(req.user._id, "upload agreement / signed agreement form", "success", `${req.user.username} uploaded a ${formType} on an appointment with ID ${appointmentId}.`);
      res.status(200).json({
          message: `${formType} uploaded successfully`,
          formUrl: result.secure_url,
      });
  } catch (error) {
      // console.error(error);
      createLog(req.user._id, "upload agreement / signed agreement form", "failed", `${req.user.username} encountered and error in processing form upload.`);
      res.status(500).json({ message: "An error occurred", error: error.message });
  }
});









module.exports = {
  createAppointment,
  totalAppointments,
  // interpreterAppointments,
  getInterpreterAppointments,
  rateAppointment,
  getUpcomingAppointments,
  getPastAppointments,
  getClientAppointments,
  // rescheduleAppointment,
  markAsComplete,
  reshAppoint,
  uploadAgreementForm,
  uploadSignedAgreementForm,
};
