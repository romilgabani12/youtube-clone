import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



/************************************************************************************************
Get the channel stats like total video views, total subscribers, total videos, total likes etc.
***************************************************************************************************/
const getChannelStats = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    // Get total video views & like count
    const totalVideoViews_Like = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalVideoViews: {
                    $sum: "$views"
                },
                totalLikes: {
                    $sum: "$likes"
                }
            }
        }
    ]);

    // Get total subscribers
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalSubscribersCount"
        }
    ]);

    // Get total videos count
    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalVideosCount"
        }
    ]);

    const status = {
        totalVideoViews: totalVideoViews_Like[0]?.totalVideoViews || 0,
        totalSubscribers: totalSubscribers[0]?.totalSubscribersCount || 0,
        totalVideos: totalVideos[0]?.totalVideosCount || 0,
        totalLikes: totalVideoViews_Like[0]?.totalLikes || 0
    }

    return res.status(200).json(new ApiResponse(
        200,
        { status },
        "Channel status fetched successfully"
    ))


})

/*******************************************
Get all the videos uploaded by the channel
********************************************/

const getChannelVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy, sortType } = req.query


    let basequery = {};

    if (query) {
        basequery.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }


    const sortOptions = {};

    if (sortBy) {
        sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
    }


    const videoAggregate = Video.aggregate([
        {
            $match: {
                ...basequery,
                isPublished: true
            },
        },
        {
            $sort: sortOptions,
        },

    ]);

    // console.log(videoAggregate);



    const options = {

        page: parseInt(page, 10),
        limit: parseInt(limit, 10)

    }

    const video = await Video.aggregatePaginate(videoAggregate, options);
    // console.log(video);

    if (!video) {
        throw new ApiError(400, "Something went wrong while get all video")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Fetched All Video Successfully"
            )
        )
})

export {
    getChannelStats,
    getChannelVideos
}
