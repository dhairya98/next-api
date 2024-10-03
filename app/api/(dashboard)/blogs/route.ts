import connect from "@/app/lib/db";
import User from "@/app/lib/models/user";
import Category from "@/app/lib/models/category";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import Blog from "@/app/lib/models/blogs";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    const searchKeyword = searchParams.get("searchTerm") as string;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const page: any = parseInt(searchParams.get("page") || "1");
    const limit: any = parseInt(searchParams.get("limit") || "2");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid or missing user ID",
        }),
        { status: 404 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid or missing Category ID",
        }),
        { status: 404 }
      );
    }

    await connect();

    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in the database" }),
        {
          status: 404,
        }
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found in the database" }),
        {
          status: 404,
        }
      );
    }

    const filter: any = {
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    };

    if (searchKeyword) {
      filter.$or = [
        {
          title: { $regex: searchKeyword, $options: "i" },
        },
        {
          description: { $regex: searchKeyword, $options: "i" },
        },
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
      };
    } else if (endDate) {
      filter.createdAt = {
        $gte: new Date(endDate),
      };
    }

    // Skip given by mongoose, e.g for 2nd Page 11-20, skip first 10 formula below
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ title: "asc" })
      .skip(skip)
      .limit(limit);

    return new NextResponse(JSON.stringify({ blogList: blogs }), {
      status: 200,
    });
  } catch (err) {
    return new NextResponse(
      JSON.stringify({
        message: "No blogs found. Please try again later.",
      }),
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    const body = await request.json();
    const { title, description } = body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing userId" }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing categoryId" }),
        { status: 400 }
      );
    }

    await connect();

    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found" }),
        {
          status: 404,
        }
      );
    }

    const newBlog = new Blog({
      title,
      description,
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    });

    await newBlog.save();
    return new NextResponse(
      JSON.stringify({ message: "Blog is created", blog: newBlog }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Error in fetching blogs" + error.message, {
      status: 500,
    });
  }
};
