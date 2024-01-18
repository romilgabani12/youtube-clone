import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


/*******************************
 toggle like or unlike on video
********************************/

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video id");
    }

    const isVideoLiked = await Like.findOne({
        $and: [
            {
                video: videoId,
            },
            {
                likedBy: req.user?._id
            }
        ]
    })

    if (!isVideoLiked) {

        const videoLiked = await Like.create({

            video: videoId,
            likedBy: req.user?._id,
        })

        if (!videoLiked) {
            throw new ApiError(400, "Something went wrong while toggling videoLiked")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videoLiked,
                    "Liked the video Successfully"
                )
            )
    } else {

        const unLikedVideo = await Like.findOneAndDelete({
            video: videoId,
            likedBy: req.user?._id,
        })

        if (!unLikedVideo) {
            throw new ApiError(400, "something went wrong while toggling the unliked video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "UnLiked the video successfully"
                )
            )
    }
})


/*********************************
 toggle like or unlike on comment
**********************************/

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id");
    }

    const isCommentLiked = await Like.findOne({
        $and: [
            {
                comment: commentId,
            },

            {
                likedBy: req.user?._id
            }
        ]
    })

    if (!isCommentLiked) {

        const commentLiked = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        if (!commentId) {
            throw new ApiError(400, "Something went wrong while toggling the commentLiked")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    commentLiked,
                    "Liked  comment successfully"
                )
            )

    } else {

        const unlikedComment = await Like.findOneAndDelete({

            comment: commentId,
            likedBy: req.user?._id
        })

        if (!unlikedComment) {
            throw new ApiError(400, "something went wrong while toggling the Unliked Comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "UnLiked Comment Successfully"
                )
            )

    }

})


/*******************************
 toggle like or unlike on Tweet
********************************/
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet Id");
    }

    const isTweetLiked = await Like.findOne({
        $and: [
            {
                tweet: tweetId,
            },

            {
                likedBy: req.user?._id
            }
        ]
    })

    if (!isTweetLiked) {

        const tweetLiked = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        if (!tweetLiked) {
            throw new ApiError(400, "Something went wrong while toggling the tweet Liked")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    tweetLiked,
                    "Liked Tweet successfully"
                )
            )

    } else {

        const unlikedTweet = await Like.findOneAndDelete({

            tweet: tweetId,
            likedBy: req.user?._id
        })

        if (!unlikedTweet) {
            throw new ApiError(400, "something went wrong while toggling the Unliked Tweet")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "UnLiked Tweet Successfully"
                )
            )


    }
})


/*******************************
 Get All liked video
********************************/
const getLikedVideos = asyncHandler(async (req, res) => {
    


    const getLikedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }

                    },

                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }


                ]
            }
        },
        {
            $unwind: "$likedVideos",
        },
        {

            $sort: {
                createdAt: -1,
            },

        },


        {
            $project: {
                likedBy: 1,
                video: 1,
                likedVideos: 1,

            }
        }


    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { getLikedVideo, TotalVideoLike: getLikedVideo.length },
                // getLikedVideo,
                "Fetched All liked video successfully"

            )
        )


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
