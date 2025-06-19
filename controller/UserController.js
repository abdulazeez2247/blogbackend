const User = require("../model/UserSchema");
const bcrypt = require('bcrypt');
const userVerify = require("../model/UserVerification");
const dotenv = require('dotenv').config()
const nodemailer = require('nodemailer')

// NODEMAILER TRANSPORTING THE MESSAGE TO GMAIL
const transporter = nodemailer.createTransport({
    service:"gmail",
    host:process.env.EMAILHOST,
    auth:{
        user:process.env.EMAILSECRET,
        pass:process.env.PASSSCRET
    },
    tls:{
        rejectUnauthorized:false
    }
})
// VERIFYING THE EMAIL
transporter.verify((error , success)=>{
    if (error) {
        console.log("Email transporter error" , error);  
    }else{
        console.log("Email transporter ready" , success);
    }
})

const aboutPage = (req , res) =>{
    res.send('Welcome to aboutpage')
    console.log('Welcome to aboutpage');
}

// TO SEND EMAIL VALIDATION
const sendEmailValidaion = async({_id, email}) =>{ 
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log('1. otp generated' , otp);

        const mailOptions = {
            from:process.env.EMAILSECRET,
            to:email,
            subject:'Verify your Email',
            html:`<p>
                Use this Otp <b>${otp}</b> to verify your accounnt
                Thank you 
            </p>`
        }

        console.log("2. Email option" , mailOptions);

        const hashedotp = await bcrypt.hash(otp , 10)

        const newVerify = new userVerify({
            userId:_id,
            otp:hashedotp,
            createdAt : Date.now(),
            expiresAt:Date.now() + 5 * 60* 1000
        })

        await newVerify.save()
        console.log("3. User verification saved" ,newVerify);

        try {
            await transporter.sendMail(mailOptions)
            console.log('4. Verification otp email sent to' , email);
            return { success: true, message: "Verification OTP email sent" }; 
        } catch (error) {
            console.log('5. failed in sending the otp to' , email);
            console.log('6. failed in sending the otp to' , error.message);
            return { success: false, message: error.message }; 
        }
    } catch (error) {
        console.log("Error in sendemailverification" , error.message);
        return { success: false, message: error.message }; 
    }
}

// TO REGISTER THE USER
const registerUser = async (req, res) =>{
   try {
        // get user request
        const {firstname, lastname,email,password,phonenumber} = req.body

        console.log('1. Received body' , req.body);
        
        // basic validation with user details
        if (!firstname || !lastname || !email || !password || !phonenumber) {
            return res.status(400).json({message:"fill all the required details"})
        }

        // check if the user exists 
        const userExist = await User.findOne({email});
        if (userExist) {
            return res.status(400).json({message:'User already exist'})
        }

        // hash the password
        const hashpassword = await bcrypt.hash(password , 10)

        const newUser  = new User(
            {
                firstname,
                lastname,
                email,
                password:hashpassword,
                phonenumber,
                isVerified:false
            }
        )

        const SavedUser = await newUser.save()
        console.log("4. Saved user info" , SavedUser);

        // Await the result from sendEmailValidaion
        const emailResult = await sendEmailValidaion(SavedUser)
        
        if (emailResult.success) {
            // Send the user object including _id here
            return res.status(201).json({
                message: 'User account created and verification OTP sent',
                user: { _id: SavedUser._id, email: SavedUser.email } // Explicitly send _id and email
            });
        } else {
            await User.deleteOne({_id: SavedUser._id});
            return res.status(500).json({message: `Registration successful but ${emailResult.message}`});
        }
           
   } catch (error) {
        return res.status(500).json({message:error.message})
   }
}

// TO VERIFY OTP CODE
const verifyOtp = async (req,res)=>{
    try {
        // GET USER REQUEST
        const {userId , otp} = req.body
        console.log('1 request received' , req.body);
        console.log("BODY RECEIVED:", req.body);


        // VALIDATE 
        if (!userId || !otp) {
            console.log('2. Empty otp details are not allowed');
            return res.status(400).json({success:false, message: 'Empty otp details are not allowed'})
        }

        // CHECK IF THE USER HAS A RECORD OF OTP
        const otpRecord = await userVerify.findOne({userId})
        if (!otpRecord) {
            console.log('3. No OTP record found for this email. Account records does not exist');
            return res.status(400).json({success:false, message: 'Account does not exist or OTP record not found'}) // Added success:false
        }

        // CHECK IF THE OTP HAS EXPIRED
        const {expiresAt  , otp:hashedotp} = otpRecord
        if (new Date(expiresAt) < Date.now()) {
            await userVerify.deleteMany({userId})
            console.log('4.OTP code has expired ');
            return res.status(400).json({success:false, message:'OTP code has expired'}) // Added success:false
        }

        // CHECK IF THE OTP IS VALID
        const validOtp = await bcrypt.compare(otp , hashedotp)
        if (!validOtp) {
            console.log('5. Invalid otp code');
            return res.status(400).json({success: false, message:"Invalid otp code"})
            
        }
        // UPDATE THE USER AFTER VERIFICATION
        await User.updateOne({_id :otpRecord.userId } , {isVerified : true})
        // DELETE USER ACCOUNT FROM OTPRECORD
        await userVerify.deleteMany({userId})
        
        // SEND A RESPONSE
        console.log('6. User email verified successfully');
        return res.status(200).json({success: true, message:"User email verified successfully"});
        
    } catch (error) {
        console.error('Error in verifyOtp:', error); 
        return res.status(500).json({success:false, message:'Server error during OTP verification'});
    }
}

// TO RESEND OTP CODE
const resendOTP = async (req,res)=>{
    try {
        const {email} = req.body
        console.log('1 request received for resendOTP', req.body);

        if (!email) {
            console.log('2 Please enter your email');
            return res.status(400).json({message: 'Email is required'})
        }

        const user= await User.findOne({email})
        if (!user) {
            console.log('3 User does not exists for resendOTP');
            return res.status(404).json({message: 'User not found'})
        }

        // DELETE ALL EXISTING OTPS FOR THIS USER
        await userVerify.deleteMany({userId: user._id})
        console.log('4 Existing OTPs deleted for user:', user._id);

        // GENERATE NEW OTP
        const otp = `${Math.floor(1000 + Math.random()* 9000)}`
        console.log('5 New OTP generated for resend:', otp);

        const hashedotp = await bcrypt.hash(otp, 10);

        // SAVE NEW OTP TO MONGODB
        const newOTP = new userVerify({
            userId: user._id,
            otp: hashedotp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000
        })
        await newOTP.save();
        console.log('6 New OTP saved to DB:', newOTP);

        const mailOptions = {
            from:process.env.EMAILSECRET,
            to:email,
            subject:'Verify your Email',
            html:`<p>
                Your new OTP is <b>${otp}</b> use this OTP to verify your account.
                Thank you!
            </p>`
        }

        // SEND EMAIL (with error handling)
        try {
            await transporter.sendMail(mailOptions);
            console.log('7 New verification OTP email sent to', email);
            return res.status(200).json({message: 'New OTP sent successfully!'});
        } catch (emailError) {
            console.error('8 Failed to send new OTP email to', email, 'Error:', emailError.message);
            return res.status(500).json({message: 'Failed to send OTP email. Please try again later.'});
        }

    } catch (error) {
        console.error('9 Resend OTP general error:', error);
        return res.status(500).json({message: 'Server error during OTP resend.'})
    }
}


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    
    // Find user by email (using your register schema)
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    
    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    
    
    return res.status(200).json({ 
      message: "Login successful.", 
      user: { _id: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname } 
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};




module.exports = {aboutPage , registerUser , verifyOtp, resendOTP, loginUser}