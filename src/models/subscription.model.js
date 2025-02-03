import mongoose, { Schema } from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //One Who is subcribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //who Got Subscribed(()) 
        ref:"User"
    },

},
{
    timestamps:true
})

export const Subscription=mongoose.model("Subscription",subscriptionSchema);