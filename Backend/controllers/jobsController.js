import Jobs from "../models/jobsModel.js";
import mongoose from "mongoose";
import moment from "moment";

// ====== CREATE JOB ======
export const createJobController = async (req, res, next) => {
  try {
    const { company, position } = req.body;
    if (!company || !position) {
      return next(new Error("Please Provide All Fields"));
    }
    req.body.createdBy = req.user.userId;
    const job = await Jobs.create(req.body);
    res.status(201).json({ 
      success: true,
      message: "Job created successfully",
      job 
    });
  } catch (error) {
    next(error);
  }
};

// ======= GET JOBS ===========
export const getAllJobsController = async (req, res, next) => {
  try {
    const { status, workType, search, sort } = req.query;
    //conditons for searching filters
    const queryObject = {
      createdBy: req.user.userId,
    };
    //logic filters
    if (status && status !== "all") {
      queryObject.status = status;
    }
    if (workType && workType !== "all") {
      queryObject.workType = workType;
    }
    if (search) {
      queryObject.position = { $regex: search, $options: "i" };
    }

    let queryResult = Jobs.find(queryObject);

    //sorting
    if (sort === "latest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "a-z") {
      queryResult = queryResult.sort("position");
    }
    if (sort === "z-a") {
      queryResult = queryResult.sort("-position");
    }
    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    queryResult = queryResult.skip(skip).limit(limit);
    //jobs count
    const totalJobs = await Jobs.countDocuments(queryObject);
    const numOfPage = Math.ceil(totalJobs / limit);

    const jobs = await queryResult;

    res.status(200).json({
      success: true,
      totalJobs,
      numOfPage,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// ======= UPDATE JOBS ===========
export const updateJobController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, position } = req.body;
    //validation
    if (!company || !position) {
      return next(new Error("Please Provide All Fields"));
    }
    //find job
    const job = await Jobs.findOne({ _id: id });
    //validation
    if (!job) {
      return next(new Error(`No job found with this id ${id}`));
    }
    if (req.user.userId !== job.createdBy.toString()) {
      return next(new Error("You are not authorized to update this job"));
    }
    const updateJob = await Jobs.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });
    //res
    res.status(200).json({ 
      success: true,
      message: "Job updated successfully",
      job: updateJob 
    });
  } catch (error) {
    next(error);
  }
};

// ======= DELETE JOBS ===========
export const deleteJobController = async (req, res, next) => {
  try {
    const { id } = req.params;
    //find job
    const job = await Jobs.findOne({ _id: id });
    //validation
    if (!job) {
      return next(new Error(`No job found with this id ${id}`));
    }
    if (req.user.userId !== job.createdBy.toString()) {
      return next(new Error("You are not authorized to delete this job"));
    }
    await job.deleteOne();
    res.status(200).json({ 
      success: true,
      message: "Job deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};

// =======  JOBS STATS & FILTERS ===========
export const jobStatsController = async (req, res, next) => {
  try {
    const stats = await Jobs.aggregate([
      // search by user jobs
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    //default stats
    const defaultStats = {
      pending: stats.find((s) => s._id === "pending")?.count || 0,
      reject: stats.find((s) => s._id === "reject")?.count || 0,
      interview: stats.find((s) => s._id === "interview")?.count || 0,
      offer: stats.find((s) => s._id === "offer")?.count || 0,
    };

    //monthly yearly stats
    let monthlyApplication = await Jobs.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    monthlyApplication = monthlyApplication
      .map((item) => {
        const {
          _id: { year, month },
          count,
        } = item;
        const date = moment()
          .month(month - 1)
          .year(year)
          .format("MMM Y");
        return { date, count };
      })
      .reverse();
    res.status(200).json({ 
      success: true,
      totalJobs: stats.length, 
      defaultStats, 
      monthlyApplication 
    });
  } catch (error) {
    next(error);
  }
};