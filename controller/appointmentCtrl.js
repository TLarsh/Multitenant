const asyncHandler = require("express-async-handler");
const Appointment = require("../models/appointmentModel");
const Client = require("../models/clientModel");
const Interpreter = require("../models/interpreterModel");
const User = require("../models/userModel");

// Api to create appointment by the company
const createAppointment = asyncHandler(async (req, res) => {
  const interpreterId = req.body.interpreter;
  const interpreterEmail = interpreterId;
  const clientId = req.body.client;
  const clientEmail = clientId.email;
  console.log(interpreterId);
  // try {
  //     const newAppointment = await Appointment.create({...req.body, creadedBy:req.user});
  //     const interpreterAppointment = await User.findByIdAndUpdate(interpreterId, {
  //         $push : {appointments:newAppointment.id},
  //     },
  //     {new:true});
  //     const interpreterAppointmentModel = await Interpreter.findOneAndUpdate({email:interpreterEmail}, {
  //         $push : {appointments:newAppointment.id},
  //     },
  //     {new:true});
  //     const clientAppointment = await User.findByIdAndUpdate(clientId, {
  //         $push : {appointments:newAppointment.id},
  //     },
  //     {new:true});
  //     const clientAppointmentModel = await Client.findOneAndUpdate({email:clientEmail}, {
  //         $push : {appointments:newAppointment.id},
  //     },
  //     {new:true});
  //     res.status(201).json({newAppointment});
  // } catch (error) {
  //     throw new Error(error);
  // }
});

// total appoinments to be seen by the super admin
const totalAppointments = asyncHandler(async (req, res) => {
  try {
    const appointments = await Appointment.countDocuments();
    res.status(200).json({ total: appointments });
  } catch (error) {
    throw new Error(error);
  }
});

const myAppointments = asyncHandler(async (req, res) => {
  const email = req.user;

  try {
    const appointments = await Appointment.find({ interpreter: email });
    // .populate('interpreter', 'fullname')
    // .populate('client', 'name');
    res.status(200).json({ appointments: appointments });
  } catch (error) {
    throw new Error(error);
  }
});

const rateAppointment = asyncHandler(async (req, res) => {
    const _id = req.user;
    console.log(_id)
    const { rating, comment, email, appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    const alreadyRated = appointment.feedback.ratedBy && (appointment.feedback.ratedBy.toString() === _id.toString())
    try {
        
        if (alreadyRated) {
          
          res.status(400).json({error:'Already rated'});
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
    }
});

const getUpcomingAppointments = asyncHandler(async (req,res) => {
  try {
    const currentDate = new Date();
    const upcomingAppointments = await Appointment.find({createdAt:{$gte:currentDate}})
    .sort("-date");
    res.status(200).json(upcomingAppointments)
  } catch (error) {
    throw new Error(error)
  }
});

const getPastAppointments = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const pastAppointments = await Appointment.find({createdAt:{$lt:currentDate}})
  res.status(200).json(pastAppointments)
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
  
  const  id   = req.body.appointmentId;
  try {
    const appointment = await Appointment.findByIdAndUpdate(id, req.body, {new:true});
    res.status(200).json({message:"Appointment is successfully rescheduled", 
    rescheduled_appointment:appointment});
    console.log(id);
  } catch (error) {
    throw new Error(error);
  }
});

const markAsComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByIdAndUpdate(id, req.body, {new:true});
    res.status(200).json({message:"Marked as complete", completed_appointment:appointment});
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createAppointment,
  totalAppointments,
  myAppointments,
  rateAppointment,
  getUpcomingAppointments,
  getPastAppointments,
  // rescheduleAppointment,
  markAsComplete,
  reshAppoint,
};
