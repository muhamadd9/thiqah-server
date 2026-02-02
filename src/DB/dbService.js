export const create = async ({ model, data = {} }) => {
  return await model.create(data);
};

export const find = async ({ model, filter = {}, select, populate = [], skip = 0, limit = 1000, sort = {} }) => {
  return await model.find(filter).select(select).populate(populate).skip(skip).limit(limit).sort(sort);
};

export const findOne = async ({ model, filter = {}, select, populate = [] }) => {
  return await model.findOne(filter).select(select).populate(populate);
};

export const findById = async ({ model, id = "", populate = [], select }) => {
  return await model.findById(id).select(select).populate(populate);
};

export const findByIdAndUpdate = async ({
  model,
  id = "",
  options = { new: true },
  data = {},
  select,
  populate = [],
}) => {
  return await model.findByIdAndUpdate(id, data, options).select(select).populate(populate);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  options = { new: true },
  data = {},
  select,
  populate = [],
}) => {
  return await model.findOneAndUpdate(filter, data, options).select(select).populate(populate);
};

export const updateOne = async ({ model, filter = {}, data = {} }) => {
  return await model.updateOne(filter, data);
};

export const updateMany = async ({ model, filter = {}, data = {} }) => {
  return await model.updateMany(filter, data);
};

export const findByIdAndDelete = async ({ model, id = "" }) => {
  return await model.findByIdAndDelete(id);
};

export const findOneAndDelete = async ({ model, filter = {} }) => {
  return await model.findOneAndDelete(filter);
};

export const deleteOne = async ({ model, filter = {} }) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async ({ model, filter = {} }) => {
  return await model.deleteMany(filter);
};

export const getAll = ({ model, filter = {}, select, populate = [], skip = 0, limit = 1000, sort = {} }) => {
  return Promise.all([
    model.countDocuments(filter),
    model.find(filter).select(select).populate(populate).skip(skip).limit(limit).sort(sort),
  ]);
};
