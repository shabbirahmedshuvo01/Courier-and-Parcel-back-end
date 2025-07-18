module.exports = async function paginate(model, query, options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await model.countDocuments(query);

    const results = await model.find(query)
        .sort(options.sort || '-createdAt')
        .skip(startIndex)
        .limit(limit);

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    return {
        count: results.length,
        pagination,
        data: results
    };
};