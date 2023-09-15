const { Op } = require("sequelize");

/**
 * Get the Sequelize operator for a given attribute and value.
 * @param {string} attribute - Operator attribute (e.g., 'gt', 'eq').
 * @param {any} value - Value to compare with.
 * @returns {Object|null} - Sequelize operator or null if invalid attribute.
 */
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

/**
 * Build a Sequelize query object for filtering and pagination.
 * @param {Object} q - Query parameters.
 * @param {Object} filter - Additional filter criteria.
 * @param {Array} searchFrom - Columns to search.
 * @param {Array} excludeColumnsFromOrder - Columns to exclude from sorting.
 * @param {Array} excludeFields - Fields to exclude from the query.
 * @returns {Object} - Sequelize query object.
 */
exports.sqquery = (
  q,
  filter,
  searchFrom = [],
  excludeColumnsFromOrder = [],
  excludeFields = []
) => {
  // Parse and validate limit and page parameters with a maximum limit
  const maxLimit = 1000; // Define your maximum limit
  const limit = Math.min(parseInt(q.limit, 10) || 10000, maxLimit);
  const page = parseInt(q.page, 10) || 1;

  // Validate and set valid sort column and order
  const validSortColumns = ["createdAt", "updatedAt", "otherColumn"]; // Define valid sort columns
  const defaultSort = "createdAt";
  const defaultSortBy = "DESC";

  const sort = validSortColumns.includes(q.sort) ? q.sort : defaultSort;
  const sortBy = q.sortBy || defaultSortBy;

  // Extract and exclude specific fields from the query parameters
  excludeFields.push("page", "sort", "limit", "fields", "sortBy", "search");
  excludeFields.forEach((el) => delete q[el]);

  // Initialize the 'where' filter with additional filter criteria
  let where = { ...filter };

  // Handle query parameters, including operators
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

  // Handle text-based search if provided
  const search = q?.search || "";
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

  // Exclude specific columns from sorting if needed
  if (excludeColumnsFromOrder.includes(sort)) {
    return { where, limit, offset: (page - 1) * limit };
  }

  return { where, order: [[sort, sortBy]], limit, offset: (page - 1) * limit };
};

/**
 * Build a Sequelize query object for user-related queries.
 * @param {Object} q - Query parameters.
 * @returns {Object} - Sequelize query object for user-related queries.
 */
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
