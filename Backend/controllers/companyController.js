import Company from '../models/companyModel.js';
import mongoose from 'mongoose';

// CREATE COMPANY (Phase 3)
export const createCompanyController = async (req, res, next) => {
  try {
    const { name, website, location, description } = req.body;
    if (!name) {
      return next('Company name is required');
    }
    
    // Check if exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return next('Company already exists');
    }

    const company = await Company.create({
      name,
      website,
      location,
      description,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL COMPANIES (Phase 3)
export const getCompaniesController = async (req, res, next) => {
  try {
    const companies = await Company.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      totalCompanies: companies.length,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE COMPANY (Phase 3)
export const updateCompanyController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ _id: id });
    if (!company) {
      return next(`No company found with id ${id}`);
    }
    if (req.user.userId !== company.createdBy.toString()) {
      return next('You are not authorized to update this company');
    }

    const updatedCompany = await Company.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE COMPANY (Phase 3)
export const deleteCompanyController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ _id: id });
    if (!company) {
      return next(`No company found with id ${id}`);
    }
    if (req.user.userId !== company.createdBy.toString()) {
      return next('You are not authorized to delete this company');
    }

    await company.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
