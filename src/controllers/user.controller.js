import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//make this Function Async Because It will Take Time For Upload ON cloudinary
const registerUser =asyncHandler(async(req,res)=>{
    //Get User Details From Frontend ..
    //Validation  --Not empty Check
    //Check If user Already Exists 
   //Check For images  //Avtar // Cover Image Chahiye 
   //Available If then upload them On cloudinary,Check Avtar Also (Uploaded Or not)
   //Create User Object - Create Entry in database 
   //Remove Password and Refresh Token Field From Response 
   //check user Is Created Or not
   //If created Then return Response
   
   const {fullName, email,username,password}=req.body;
   console.log(email,fullName,username,password);
   
   //Validation Wala Part 
   if(
    [fullName,email,username,password].some((field)=> field?.trim()==="")
   ){
     throw new ApiError(400,"All Fields Must Be Filled!!");
   }
   //User Exists Karta hai Ya Nhi >>Check
   const existedUser=User.findOne({
    $or:[{username},{email}]
   })

   if(existedUser){
    throw new ApiError(409,"User with email or username already exists");
   }

   //Now Middle Ware Added Extra Fields In req.:=>
    //Multer Added Request.files Options For this

   const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;
   const x=req.files?.avatar;
   console.log(x);
   //Try To console.log This Also To get Better Understanding

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is Required");
   }
   //Upload Them on Cloudinary
   const avatar=await uploadOnCloudinary(avatarLocalPath)
   const coverImage= await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
     throw new ApiError(400,"Please Add Avatar Image");
   }
   const user=await User.create({
     fullName,
     avatar:avatar.url,
     coverImage:coverImage?.url || "",
     email,
     username:username.toLowerCase()
   })
   const createdUser=await User.findById(user._id).select(
     "-password -refreshToken"
   )

   if(!createdUser){
       throw new ApiError(500,"Something went Wrong While Registering The User!!");
   }
   return res.this.status(201).json(
       new ApiResponse(200,createdUser,"User Registered successfuly")
   )
})

export {registerUser}