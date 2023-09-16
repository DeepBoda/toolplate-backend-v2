const { Op } = require("sequelize");
const { dateFilter } = require("./service");

exports.getOpAttributeValue = (attribute, value) => {
  const operators = {
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    eq: Op.eq,
    ne: Op.ne,
    notBetween: Op.notBetween,
    between: Op.between,
    in: Op.in,
    notIn: Op.notIn,
  };

  return operators[attribute] ? { [operators[attribute]]: value } : null;
};

exports.sqquery = (
  q,
  filter,
  searchFrom = [],
  excludeColumnsFromOrder = [],
  excludeFields = []
) => {
  const limit = parseInt(q.limit) || 10000;
  const page = parseInt(q.page) || 1;
  const skip = (page - 1) * limit;
  const sort = q.sort || "createdAt";
  const sortBy = q.sortBy || "DESC";
  const search = q?.search || "";

  excludeFields.push("page", "sort", "limit", "fields", "sortBy", "search");

  excludeFields.forEach((el) => delete q[el]);

  let where = { ...filter };

  Object.keys(q).forEach((v) => {
    if (typeof q[v] === "object") {
      Object.keys(q[v]).forEach((e) => {
        const obj = exports.getOpAttributeValue(e, q[v][e]);
        if (obj) where[v] = obj;
      });
    } else {
      where[v] = q[v];
    }
  });

  if (search && searchFrom.length) {
    const searchData = searchFrom.map((columnName) => ({
      [columnName]: {
        [Op.like]: `%${search}%`,
      },
    }));

    if (Object.keys(where).length) {
      where = { ...where, [Op.or]: searchData };
    } else {
      where = { [Op.or]: searchData };
    }
  }

  if (excludeColumnsFromOrder.includes(sort)) {
    return { where, limit, offset: skip };
  }

  return { where, order: [[sort, sortBy]], limit, offset: skip };
};

exports.usersqquery = (q) => {
  const limit = parseInt(q?.limit) || 10000;
  const page = parseInt(q?.page) || 1;
  const skip = (page - 1) * limit;
  const sort = q?.sort || "createdAt";
  const sortBy = q?.sortBy || "DESC";

  if (q?.limit) {
    return { order: [[sort, sortBy]], limit, offset: skip };
  }

  return { order: [[sort, sortBy]] };
};
