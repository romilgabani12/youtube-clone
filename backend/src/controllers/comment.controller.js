import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


/****************************
 get all comments for a video
******************************/
const getVideoComments = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid valid id")
    }


    try {

        const getAllComments = await Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "commentOwner",
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
                    commentOwnerDetails: {
                        $first: "$commentOwner"
                    }
                }
            },

            {
                $project: {
                    commentOwnerDetails: 1,
                    content: 1,
                    // video: 1,
                    owner: 1
                }
            },

            {
                $skip: (page - 1) * limit
            },
            {
                $limit: Number(limit)
            }

        ])

        if (!getAllComments.length) {
            throw new ApiError(400, "No comments on this video")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200, getAllComments, "Fetch All comments successfully"
                )
            )

    } catch (error) {

        throw new ApiError(400, error?.message || "something went wrong while fetch all comments for a video")

    }

})


/****************************
 add a comment to a video
******************************/
const addComment = asyncHandler(async (req, res) => {

    

    const { videoId } = req.params;

    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id...")
    }

    if (!content) {
        throw new ApiError(400, "content is required...")
    }


    try {

        const comment = await Comment.create({
            content,
            video: videoId,
            owner: req.user?._id
        })

        const createdComment = await Comment.findById(comment._id);

        if (!createdComment) {
            throw new ApiError(400, "Something went wrong while createing the comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, createdComment, "Creating a comment successfully")
            )


    } catch (error) {

        throw new ApiError(500, "Internal Server Error");
    }
})


/****************************
 update a comment
******************************/

const updateComment = asyncHandler(async (req, res) => {
    

    const { commentId } = req.params;

    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id...")
    }

    if (!content) {
        throw new ApiError(400, "Content is required...")
    }



    try {

        const comment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        )

        if (!comment) {
            throw new ApiError(400, "SOomething went wrong while updating the comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    comment,
                    "Update the comment successfully"
                )
            )
    } catch (error) {

        throw new ApiError(500, "Internal Server Error");
    }

})


/****************************
 delete a comment
******************************/
const deleteComment = asyncHandler(async (req, res) => {
    

    const { commentId } = req.params;


    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id...")
    }

    try {

        const commentDeleted = await Comment.findByIdAndDelete(commentId);

        if (!commentDeleted) {
            throw new ApiError(400, "Something went wrong while deleting the comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Delete the comment successfully"
                )
            )
    } catch (error) {

        throw new ApiError(500, "Internal Server Error");
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}