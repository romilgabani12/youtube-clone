import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/*************************************************
 common callback function == generate and accesss tokens 
**************************************************/

const generateAccessAndRefreshTokens = async (userId) => {

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken }

}


/***********************
 register user
************************/
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frotend
    // validation -- not empty
    // check if user already exists: userName, email
    // check for images, check for avatar
    // upload them to cloudinary,avatar
    // create user object -- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, userName, password } = req.body;
    // console.log(req.body);


    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }


    const existUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existUser) {
        throw new ApiError(409, "User with email or username already exists");
    }


    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath;
    //Array.isArray() returns true if a datatype is an arry, otherwise false:
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {

        throw new ApiError(400, "Avatar file is required");

    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})



/***********************
 login user
************************/

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation -- not empty
    // find the user in Database : userName or email
    // check password -- correct or not
    // generate access tokens and referesh tokens
    // send cookies to user

    const { email, userName, password } = req.body;

    if (!email && !userName) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    if (!loggedInUser) {
        throw new ApiError(500, "Something went wrong while login the user")
    }

    // cookies modified only server side
    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    // send accessToken and refreshToken to user -- reason (user can save on localStorage) // this case is handle 
                    user: loggedInUser, accessToken, refreshToken

                },

                "User Logged In Successfully"
            )
        )




})




export {
    registerUser,
    loginUser,
}