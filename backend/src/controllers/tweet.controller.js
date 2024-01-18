import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"



/*****************
 Create Tweet
******************/
const createTweet = asyncHandler(async (req, res) => {


    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required...")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    const createdTweet = await Tweet.findById(tweet._id);

    if (!createTweet) {
        throw new ApiError(400, "something went wrond while create a tweet")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdTweet, "tweet is created... successfully")
        )
})


/*****************
 get user tweets
******************/
const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id...")
    }

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "contents",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            userName: 1,
                            avatar: 1,

                        }
                    },

                ]
            }
        },

        {
            $addFields: {
                tweetsUserDetails: {
                    $first: "$contents"
                }
            }
        },

        {
            $project: {
                tweetsUserDetails: 1,
                content: 1,

            }
        }
    ])
    // console.log(userTweets);

    if (!userTweets?.length) {
        throw new ApiError(400, "No User Tweets")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, userTweets, "Fetched User Tweets Successfully...")
        )


})


/*****************
 update tweet
******************/
const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;

    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet id")
    }



    if (!content) {
        throw new ApiError(400, "Content is required...")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    // console.log(tweet);
    if (!tweet) {
        throw new ApiError(404, "Something went wrong while update the tweets")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "Tweeet updated successfully"

            )
        )


})


/*****************
 delete tweet
******************/
const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);
    // console.log(deleteTweet);

    if (!deleteTweet) {
        throw new ApiError(400, "Something went wrong while delete the tweets...")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Delete the tweet successfully"

            )
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}