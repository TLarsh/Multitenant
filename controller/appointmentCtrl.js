const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const Client = require("../models/clientModel");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");


// creates appointment and lists the appointmens to the user appointments array

const createAppointment = asyncHandler(async (req, res) => {
  const {interpreter, client, email, address, phone, date, time, note, location } = req.body;  
  console.log(interpreter)
  try {
    const clientId = await User.findById(client);
    console.log(clientId)
    const interpreterId = await User.findById(interpreter)
    console.log(interpreterId)
    if (!clientId) return res.status(400).json({error:"Client not found"});
    if (!interpreterId) return res.status(400).json({error:"Interpreter not found"});
    const newAppointment = new Appointment({
      interpreter:interpreter,
      client:client,
      email:email,
      address:address,
      phone:phone,
      date:date,
      time:time,
      note:note,
      location:location,
      createdBy:req.user,
    });
    console.log(newAppointment)
    newAppointment.save();
    clientId.appointments.push(newAppointment._id);
    interpreterId.appointments.push(newAppointment._id);
    await clientId.save();
    await interpreterId.save();

    res.status(200).json({message:"Appointment successfully created", 
    appointment:newAppointment});
  } catch (error) {
    // throw new Error(error)
    res.status(500).json({error:"Error creating appointment"})
  }
})

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
    res.status(500).json({error: "Error retrieving total appointments", message:err});

  }
});

// all appointments for interpreter in current session
// const interpreterAppointments = asyncHandler(async (req, res) => {
//   const { id } = req.user;

//   try {
//     const appointments = await Appointment.find({ interpreter: id });
//     // .populate('interpreter', 'fullname')
//     // .populate('client', 'name');
//     res.status(200).json({ appointments: appointments });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// // all appointments for client in current session
// const clientAppointments = asyncHandler(async (req, res) => {
//   const { id } = req.user;

//   try {
//     const appointments = await Appointment.find({ interpreter: id });
//     // .populate('interpreter', 'fullname')
//     // .populate('client', 'name');
//     res.status(200).json({ appointments: appointments });
//   } catch (error) {
//     throw new Error(error);
//   }
// });


// get appointments for client
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

// get appointments for interpreter
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






const rateAppointment = asyncHandler(async (req, res) => {
    const _id = req.user;
    console.log(_id)
    const { rating, comment, email, appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    console.log(appointment)
    const alreadyRated = appointment.feedback.ratedBy && (appointment.feedback.ratedBy.toString() === _id.toString())
    try {
        if (req.user.id.toString() !== appointment.client.toString()) {
          return res.status(403).json({error:"Not authorizer"})
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
          res.json(rateAppointment);
        }
    } catch (error) {
      throw new Error(error);
      // res.status(500).json({error: "Error giving feedback"});
    }
});

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
    res.status(500).json({error: "Error retrieving upcoming appointments"});
  }
});

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
    res.status(500).json({error: "Error retrieving upcoming appointments"});
  }
});

// const rescheduleAppointment = asyncHandler(async (req, res) => {
//   const { myId } = req.body;
//   // console.log(id)
//   try{
//     console.log(myId)
//   } catch (error) {
//     throw new Error(error);
//   }
  // const appointment = await Appointment.findByIdAndUpdate(id, req.body, {new:true});
  // res.status(200).json({message:"Appointment is successfully rescheduled", 
  // rescheduled_appointment:appointment});
// });

const reshAppoint = asyncHandler( async (req, res) => {
  const user = req.user;
  const  { appointmentId }  = req.params;
  console.log({aptId:appointmentId});
  console.log({logedUser:user.id})
  
  const appointment = await Appointment.findById(appointmentId);
  if(!appointment){
    return res.status(404).json({error:"Appointment not found"})
  }
  console.log({apptIdInt:appointment});
    if (user.id.toString() === appointment.interpreter.toString()) {
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, req.body, {new:true});
      res.status(200).json({message:"Appointment is successfully rescheduled", 
      rescheduled_appointment:appointment});
    } else if (user.id.toString() === appointment.client.toString()) {
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, req.body, {new:true});
      res.status(200).json({message:"Appointment is successfully rescheduled", 
      rescheduled_appointment:appointment});
    } else {
      res.status(403).json({error:"Not authorized!"})
    }
});

const markAsComplete = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  
  const {note} = req.body;
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({error:"Appointment not found"});
    }
    if (appointment.interpreter.toString() !== req.user.toString()) {
      return res.status(403).json({error:"Not authorized user to update this appointment"});
    }
    appointment.status = "completed";
    if (note) {
      appointment.note = note
    }
    await appointment.save();
    res.status(200).json({message: "Marked as complete", completed_appointment:appointment})
  } catch (error) {
    // throw new Error(error)
    res.status(500).json({error: "There is an error marking apointment as complete"});
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

// upload an agreement form
const uploadAgreementForm = asyncHandler(async(req, res) => {
  const { id } = req.params;
  try {
    const appointment = Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({error:"Appointment not found"})
    }
    if (appointment.client.toString !== req.user.id.toString()) {
      return res.status(403).json({error: "You are not authorized for this action"});
    }
    appointment.agreementForm = req.file.path;
    await appointment.save();
    res.status(200).json({message:"Agreement form uploaded successfully!"})
  } catch (error) {
    res.status(400).json({error:"Error uploading agreement form"})
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
