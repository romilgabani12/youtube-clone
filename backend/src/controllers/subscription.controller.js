import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";


/*********************************************************
 Toggle Subscription (Channel Subscribed or Unsubscribed)
**********************************************************/

const toggleSubscription = asyncHandler(async (req, res) => {

    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id ");
    }

    const isSubscribed = await Subscription.findOne({
        $and: [
            {
                subscriber: req.user?._id
            },
            {
                channel: channelId
            }
        ]
    })




    if (!isSubscribed) {

        const subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId

        })

        const createSubscription = await Subscription.findById(subscription._id);
        // console.log(createSubscription);

        if (!createSubscription) {
            throw new ApiError(500, "Some went wrong while toggling subscription");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "subscribed to channel  successfully"))

    } else {

        const unsubscribeChannel = await Subscription.findOneAndDelete({
            subscriber: req.user?._id,
            channel: channelId,
        });

        if (!unsubscribeChannel) {
            throw new ApiError(500, "Some error occured while toggling subscription");
        } else {

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "unsubscribed  channel  successfully."
                    )
                );
        }
    }




})


/*********************************************************
controller to return subscriber list of a channel
**********************************************************/


const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID ")
    }

    const subscriberListOfChannel = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },

        {

            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            userName: 1,
                            email: 1,
                            avatar: 1,
                            coverImage: 1

                        }
                    },

                ]
            },


        },

        {

            $addFields: {
                subscriberDetails: {
                    $first: "$subscribers"
                }
            }
        },



        {
            $project: {
                subscriberDetails: 1,
                subscriber: 1,
                channel: 1,
            }
        }



    ])
    // console.log(subscriberListOfChannel);

    if (!subscriberListOfChannel?.length) {
        throw new ApiError(404, "No Subscribers in this Channel")
    }


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            subscriberListOfChannel,
            "fetched subscriber list of a user channel successfully "

        ))
})


/***************************************************************
controller to return channel list to which user has subscribed
***************************************************************/

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscribed Id ");
    }


    const channelList = await Subscription.aggregate([

        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            userName: 1,
                            email: 1,
                            avatar: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {
                channelList: {
                    $first: "$channels"
                }
            }
        },

        {
            $project: {
                channelList: 1,
                channel: 1,
                subscriber: 1
            }
        }

    ])

    if (!channelList?.length) {
        throw new ApiError(404, "No Channels are Subscribed!!")
    }


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channelList,
            "fetched channel list of a user subscribed channels successfully"
        ))


})



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
}