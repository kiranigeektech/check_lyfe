class Currency {
  prefunction = async () => {
    return true;
  };

  addCurrency = async (req, h) => {
    try {
      const payload = req.payload;

      const data = await Models.currencies.create({
        name: payload.name,
        currencyCode: payload.currencyCode,
        currencySymbol: payload.currencySymbol,
        isDeleted: 0,
      });

      return h
        .response({
          message: req.i18n.__("CURRENCY_SUCCESSFULLY_ADDED"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  editCurrency = async (req, h) => {
    try {
      const payload = req.payload;

      const data = await Models.currencies.update(
        {
          name: payload.name,
          currencyCode: payload.currencyCode,
          currencySymbol: payload.currencySymbol,
        },
        {
          where: {
            id: payload.id,
          },
        }
      );

      return h
        .response({
          message: req.i18n.__("CURRENCY_SUCCESSFULLY_UPDATED"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  getCurrency = async (req, h) => {
    try {
      const data = await Models.currencies.findAll({
        attributes: ["id", "name", "currencyCode", "currencySymbol"],
        where: { isDeleted: 0 },
      });

      return h
        .response({
          responseData: {
            data: data,
          },
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  getCurrencyWithId = async (req, h) => {
    try {
      const payload = req.query;
      const data = await Models.currencies.findOne({
        attributes: ["id", "name", "currencyCode", "currencySymbol"],
        where: { id: payload.id, isDeleted: 0 },
      });

      return h.response({
        responseData: {
          data: data,
        },
      });
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  deleteCurrency = async (req, h) => {
    try {
      const payload = req.payload;

      const data = await Models.currencies.update(
        {
          isDeleted: 1,
        },
        {
          where: {
            id: payload.id,
          },
        }
      );

      return h
        .response({
          message: req.i18n.__("CURRENCY_SUCCESSFULLY_DELETED"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };
}

module.exports = new Currency();
