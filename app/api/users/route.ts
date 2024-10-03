import connect from "@/app/lib/db";
import User from "@/app/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

const ObjectId = require("mongoose").Types.ObjectId;
console.log("ObjectId", ObjectId);

export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (err) {
    return new NextResponse("Error fetching users" + err, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    await connect();
    const newUser = new User(body);
    await newUser.save();

    return new NextResponse(
      JSON.stringify({ message: "Successfully added new user", user: newUser }),
      { status: 200 }
    );
  } catch (err: any) {
    return new NextResponse("Error adding user" + err, { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();

    const { userId, newUserName } = body;

    await connect();

    if (!userId || !newUserName) {
      return new NextResponse(
        JSON.stringify({ message: "Id or username not found" }),
        { status: 404 }
      );
    }

    // Below code is to check if it is as per norms given by

    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User ID" }), {
        status: 404,
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { username: newUserName },
      { new: true } // return updated user instead of old one whcih was stored previously...
    );

    if (!updatedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in DB" }),
        { status: 400 }
      );
    }

    return new NextResponse(JSON.stringify({ message: "User Updated" }), {
      status: 200,
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ message: "Error updating user" }),
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "Id not found" }), {
        status: 404,
      });
    }

    // Below code is to check if it is as per norms given by

    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User ID" }), {
        status: 404,
      });
    }

    await connect();

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in DB" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User Deleted Successfully" }),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ message: "Error deleting user" }),
      { status: 500 }
    );
  }
};
