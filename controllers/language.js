class Language {
  prefunction = async () => {
    return true;
  };

  getLanguages = async (req, h) => {
    try {
      let data = await Models.languages.findAll({
        where: {
          isDeleted: 0,
        },
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
}

module.exports = new Language();
