import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



/****************************
 create playlist
******************************/
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body


    if ([name, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existPlaylist = await Playlist.findOne({

        $or: [
            { name },
            { description }
        ]
    })

    if (existPlaylist) {
        throw new ApiError(400, "Playlist with name or description already exists");
    }


    const playlist = await Playlist.create({

        name,
        description,
        owner: req.user?._id

    })

    const createdPlaylist = await Playlist.findById(playlist._id);

    if (!createdPlaylist) {
        throw new ApiError(400, "Something went wrong while creating a playlist")
    }




    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdPlaylist,
                "Playlist created successfully"

            )
        )




})


/****************************
 Get User playlist
******************************/
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id")
    }



    const userPlaylist = await Playlist.find({
        owner: new mongoose.Types.ObjectId(userId)
    })

    if (!userPlaylist.length) {
        throw new ApiError(404, "No playlist found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userPlaylist,
                "Fetched User Playlist successfully"

            )
        )
})



/****************************
 Get PlayList
******************************/
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    // const playlist = await Playlist.findOne({
    //     _id: playlistId
    // })

    const playlist = await Playlist.findById(playlistId)


    if (!playlist) {
        throw new ApiError(404, "No Playlist found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "fetch playlist successfully"
            )
        )


})



/****************************
Add video to playlist
******************************/
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "playlist id and video id is invalid")
    }


    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "No Playlist found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {

        throw new ApiError(403, "You don't have permission to add video in this playlist!");
    }


    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No video found")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "video already exists in this playlist!!")
    }


    const addedToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {

            $push: {
                videos: videoId
            }

        },
        {
            new: true
        }
    )

    if (!addedToPlaylist) {
        throw new ApiError(400, "something went wrong while added video to playlist !!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                addedToPlaylist,
                "added video in playlist successfully"
            )
        )



})


/****************************
 remove video from playlist
******************************/
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "playlist id and video id is invalid")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "No Playlist found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {

        throw new ApiError(403, "You don't have permission to remove video in this playlist!");
    }


    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "No video found")
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "video  does not exists in this playlist!!")
    }

    const removedToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {

            $pull: {
                videos: videoId
            }

        },
        {
            new: true
        }
    )

    if (!removedToPlaylist) {
        throw new ApiError(400, "something went wrong while removed video to playlist !!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                removedToPlaylist,
                "removed video in playlist successfully"
            )
        )

})


/****************************
 Delete playlist
******************************/
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params


    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist id")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this playlist!");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(400, "something went wrong while deleting the Playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Delete the playlist successfully"
            )
        )


})


/****************************
Update playlist
******************************/
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if ([name, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }


    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new ApiError(400, "something went wrong while updating the playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist updated successfully"
            )
        )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}