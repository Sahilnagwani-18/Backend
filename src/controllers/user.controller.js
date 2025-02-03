import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshToken= async(userId)=>{
    try{
      const user=await User.findById(userId);
      const accessToken=user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()

      user.refreshToken=refreshToken
      await user.save({validateBeforeSave:false})

      return {accessToken,refreshToken}

    }
    catch(error){
      throw new ApiError(500,"Something Went Wrong While Genrating Refresh and access Tokens");
    }
}

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
   const existedUser=await User.findOne({
    $or:[{username},{email}]
   })

   if(existedUser){
    throw new ApiError(409,"User with email or username already exists");
   }

   //Now Middle Ware Added Extra Fields In req.:=>
    //Multer Added Request.files Options For this

   const avatarLocalPath=req.files?.avatar[0]?.path;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
       coverImageLocalPath=req.files.coverImage[0].path
   }
   
 
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
     username:username.toLowerCase(),
     password,
   })
   const createdUser=await User.findById(user._id).select(
     "-password -refreshToken"
   )

   if(!createdUser){
       throw new ApiError(500,"Something went Wrong While Registering The User!!");
   }
   return res.status(201).json(
       new ApiResponse(200,createdUser,"User Registered successfuly")
   )
})

const loginUser = asyncHandler(async(req,res)=>{
  //Todos
   //1 Get all the details of user 
   //Search For an existing User 
   //If user Exists then Check Password Matched with User name 
   //If matched Accesss Token Give 
   //Send Coookies And say That Login done!!
   //If Not Then Try Again

   const {email,username,password}=req.body;
   console.log(email)

   if (!username && !email) {
    throw new ApiError(400, "username or email is required")
   }
   const user= await User.findOne({
    $or:[{email},{username}]
   })
   if(!user){
      throw new ApiError(404,"User Does not Exists");
   }

   const isPasswordValid=await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials");;
   }
   const {accessToken,refreshToken}=await generateAccessAndRefereshToken(user._id)
   const loggedInUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )

   const options={
      httpOnly:true,
      //Http Only :Basically Cookies Can be modified by anyone from frontend so to ignore that httpOnly is used
      //Now the cookies will be only server Modifyable 
      secure:true
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
     new ApiResponse(
      200,{
        user:loggedInUser,accessToken,refreshToken
      },
      "User Logged In SuccessFully"
     )
   )

})

const logoutUser = asyncHandler(async(req,res)=>{
    //1)Remove Cookies 
    
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new:true
      }
    )
    const options={
      httpOnly:true,
      secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out SuccessFully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefereshToken= req.cookies.refreshToken || req.body.refreshToken;

  
    if(!incomingRefereshToken){
      throw new ApiError(401,"unauthorized request");
    }
  try {
    const decodedToken=jwt.verify(
      incomingRefereshToken,process.env.REFRESH_TOKEN_SECRET
    )
    const user=await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(404,"Invalid Refresh Token !!")
    }
  
    if(incomingRefereshToken!== user?.refreshToken){
      throw new ApiError(401,"Refresh Token is expired or use !!")
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
    const {accessToken,newrefreshToken}=await generateAccessAndRefereshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newrefreshToken},
        "Access Token Refreshed Successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Refresh Token !!")
  }
  
})


export {
  registerUser,loginUser,logoutUser,refreshAccessToken
}