import { asyncHandler } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.response.js";
import userModel from "../../DB/model/User.model.js";
import { findById, getAll, findByIdAndUpdate, create } from "../../DB/dbService.js";
import { hashPassword } from "../../utils/security/hash.js";

export const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;
    const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };
    const { search } = req.query;

    // Filter to exclude current user
    const filter = { _id: { $ne: req.user.id } };

    if (search) {
        filter.$or = [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    const [count, users] = await getAll({ model: userModel, filter, skip, limit, sort });
    return successResponse({ res, data: { count, page, limit, users } });
});

export const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await findById({
        model: userModel,
        id,
        select: "-password"
    });
    if (!user) return next(new Error("user not found", { cause: 404 }));

    return successResponse({ res, data: user });
});

export const getMe = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user?.id;
    const me = await findById({
        model: userModel,
        id: currentUserId,
        select: "-password"
    });
    if (!me) return next(new Error("user not found", { cause: 404 }));

    return successResponse({ res, data: me });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user.id;
    const { fullname } = req.body;

    const updated = await findByIdAndUpdate({
        model: userModel,
        id: currentUserId,
        data: { fullname },
        options: { new: true, select: "-password" },
    });
    return successResponse({ res, data: updated });
});

// Admin: Create User
export const createUser = asyncHandler(async (req, res, next) => {
    const { fullname, email, password, phone, role } = req.body;
    // Check dupe
    const exists = await userModel.findOne({ $or: [{ email: email || 'x' }, { phone: phone || 'x' }] });
    if (exists) return next(new Error("User already exists"));

    const user = await create({
        model: userModel,
        data: {
            fullname,
            email,
            phone,
            role,
            password: hashPassword({ plainText: password })
        }
    });
    return successResponse({ res, data: { user } });
});

// Admin: Update User
export const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { fullname, email, phone, role, password } = req.body;

    const data = { fullname, email, phone, role };
    if (password) data.password = hashPassword({ plainText: password });

    const updated = await findByIdAndUpdate({
        model: userModel,
        id,
        data,
        options: { new: true, select: "-password" }
    });
    if (!updated) return next(new Error("User not found", { cause: 404 }));
    return successResponse({ res, data: { user: updated } });
});

// Admin: Delete User
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) return next(new Error("User not found", { cause: 404 }));
    return successResponse({ res, data: { message: "User deleted" } });
});



