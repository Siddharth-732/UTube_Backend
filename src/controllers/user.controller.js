import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";
// import { upload } from "../middlewares/multer.middleware.js";
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // console.log("This is req.body->>", req.body);
  
  // get User detail from the frontend
  // check if the user already exist: username and email
  // get Avatar, image
  // upload them to cloudinary, avatar
  // Add the username, password and EmailID in the DB.
  const { username, email, password, fullname } = req.body;

  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User already exist with the current username or email"
    );
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await cloudinaryUpload(avatarLocalPath);
  const coverImage = await cloudinaryUpload(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  
  // console.log(user.id);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(504, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Sucessfully"));
});
const generatedAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};
const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // username or passwords
  // check if user exists
  // check if the access token is valid or not.
  // if valid login accept
  // if not-> check the creds, if correct then give a new access token and a refresh token to the user.
  // save the access and refresh token in the DB
  // set a timer that the access token should be deleted after X time.
  // send as cookies
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or password is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log("User data is ->",user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPassworCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid username credentials");
  }

  const { accessToken, refreshToken } = await generatedAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  // console.log(req.user._id);
  
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});
const refreshAccessToken= asyncHandler(async (req,res)=>{
  const incomingRefreshToken=  req.cookie.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Token request")
  }
try {
    const decodedToken= jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401, "No user exists")
    }
  
    if(incomingRefreshToken !=user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or incorrect")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newrefreshToken} = await generatedAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("accessToken", newrefreshToken)
    .json(new ApiResponse(200,{accessToken, refreshToken: newrefreshToken},"Access token refreshed"))
} catch (error) {
  throw new ApiError(401,error?.message || "user.controller try catch")
}

}
)


// console.log(typeof registerUser);

export { registerUser, loginUser, logoutUser,refreshAccessToken };
