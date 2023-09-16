const { Op } = require("sequelize");

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

exports.getOpAttributeValue = (attribute, value) => {
  return operators[attribute] ? { [operators[attribute]]: value } : null;
};

exports.sqquery = (
  {
    limit = 10000,
    page = 1,
    sort = "createdAt",
    sortBy = "DESC",
    search = "",
    ...q
  },
  filter,
  searchFrom = [],
  excludeColumnsFromOrder = [],
  excludeFields = ["page", "sort", "limit", "fields", "sortBy", "search"]
) => {
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

    where = Object.keys(where).length
      ? { ...where, [Op.or]: searchData }
      : { [Op.or]: searchData };
  }

  if (excludeColumnsFromOrder.includes(sort)) {
    return { where, limit, offset: (page - 1) * limit };
  }

  return { where, order: [[sort, sortBy]], limit, offset: (page - 1) * limit };
};

exports.usersqquery = ({
  limit = 10000,
  page = 1,
  sort = "createdAt",
  sortBy = "DESC",
}) => {
  return { order: [[sort, sortBy]], limit, offset: (page - 1) * limit };
};
