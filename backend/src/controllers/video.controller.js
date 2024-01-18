import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


/****************************
 Get All User Video
******************************/

const getAllVideos = asyncHandler(async (req, res) => {

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


/****************************
 Get All My Video
******************************/
const getMyAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query


    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }


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
                owner: new mongoose.Types.ObjectId(userId),
                isPublished: true
            },
        },
        {
            $sort: sortOptions,
        },

    ]);



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


/****************************
 Publish Or Create video
******************************/

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFileLocalPath = await req.files?.videoFile[0].path;

    const thumbnailLocalpath = await req.files?.thumbnail[0].path;

    if (!videoFileLocalPath && !thumbnailLocalpath) {
        throw new ApiError(400, "All files are required ")
    }


    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    // console.log(videoFile);
    // console.log(videoFile.url);
    // console.log(videoFile.duration);

    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath);

    if (!videoFile && !thumbnail) {
        throw new ApiError(400, "All files are required ")
    }

    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoFile?.duration,
        owner: req.user?._id

    })

    const videoCreated = await Video.findById(video._id);

    if (!videoCreated) {
        throw new ApiError(404, "something went wrong while creating a video")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoCreated,
                "video created successfully"
            )
        )
})


/**********************************
 Get Video By Id with All Details
**********************************/
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video Id is not valid");
    }

    let video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            avatar: 1

                        }
                    }

                ]

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
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },

                likes: {
                    $size: "$likes"
                },

                views: {
                    $add: [1, "$views"]
                },

                totalComments: {
                    $size: "$comments",

                },

            }
        }
    ])

    if (video.length !== 0) {
        video = video[0]
    }

    await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                views: video.views
            }
        },
        {
            new: true
        }

    )


    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet: {
                watchHistory: videoId
            }
        },

        {
            new: true
        }
    )


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "fetch Video with details successfully"
            )
        )


})

/****************************
 Update The video Details
******************************/

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // console.log(videoId);

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID is not valid")
    }


    const { title, description } = req.body;

    const thumbnailLocalpath = req.file?.path

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "title and description fields are required")
    }


    if (!thumbnailLocalpath) {
        throw new ApiError(400, "Thumbnail file is missing");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath);

    if (!thumbnail?.url) {
        throw new ApiError(400, "error while uploading a thumbnail")
    }

    const videoIdDetails = await Video.findById(videoId);
    // console.log(videoIdDetails);

    const isDeleted = await deleteFromCloudinary(videoIdDetails?.thumbnail);

    if (!isDeleted) {
        throw new ApiError(400, "Error while deleting the thumbnail on cloudinary");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail?.url,
                title,
                description

            }
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(404, "something went wrong while updating the video details on cloudinary")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "update the video details successfully"
            )
        )




})


/****************************
 Delete  video
******************************/
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params



    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video is is not valid")
    }

    const videoIdDetails = await Video.findById(videoId);
    // console.log(videoIdDetails);

    if (!videoIdDetails) {
        throw new ApiError(400, "video does not exits...")
    }

    // const videoDeleted = await Video.findByIdAndDelete(videoId);

    // if (!videoDeleted) {
    //     throw new ApiError(400, "something went wrong while deleting the video")
    // }

    const isthumbnailDeleted = await deleteFromCloudinary(videoIdDetails?.thumbnail, "image");
    // console.log(isthumbnailDeleted);

    const isVideoDeleted = await deleteFromCloudinary(videoIdDetails?.videoFile, "video");

    // console.log(isVideoDeleted);

    if (!isVideoDeleted || !isthumbnailDeleted) {
        throw new ApiError(400, "Error while deleting the video  on cloudinary")
    }

    await videoIdDetails.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "delete the video successfully"
            )
        )
})

/*********************************
 Toggle Publish status true/false 
*********************************/

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, " Invalid Video Id ")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video does not exists")
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "isPublished status toggle successfully"
            )
        )

})

export {
    getAllVideos,
    getMyAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}