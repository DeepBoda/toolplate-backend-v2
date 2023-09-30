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

  Object.entries(q).forEach(([key, value]) => {
    if (typeof value === "object") {
      Object.entries(value).forEach(([op, val]) => {
        const obj = exports.getOpAttributeValue(op, val);
        if (obj) where[key] = obj;
      });
    } else {
      where[key] = value;
    }
  });

  if (search && searchFrom.length) {
    const searchData = searchFrom.map((columnName) => ({
      [columnName]: {
        [Op.like]: `%${search}%`,
      },
    }));

    where = Object.keys(where).length
      ? { ...where, [Op.or]: searchData }
      : { [Op.or]: searchData };
  }

  if (excludeColumnsFromOrder.includes(sort)) {
    return { where, limit, offset: skip };
  }

  return { where, order: [[sort, sortBy]], limit, offset: skip };
};

exports.usersqquery = (q) => {
  // Extract limit and page properties with default values
  const limit = parseInt(q?.limit) || 10000;
  const page = parseInt(q?.page) || 1;

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Extract sort and sortBy properties with default values
  const sort = q?.sort || "createdAt";
  const sortBy = q?.sortBy || "DESC";

  // Create the order property
  const order = [[sort, sortBy]];

  // Check if limit property is present
  if (q?.limit) {
    return { order, limit, offset: skip };
  }

  return { order };
};
