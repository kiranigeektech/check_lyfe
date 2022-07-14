const { QueryTypes } = require("sequelize");
class Attribute {
  prefunction = async () => {
    return true;
  };

  addAttributes = async (req, h) => {
    try {
      const payload = req.payload;
      let langCode = DefaultLanguage.dataValues.code;
      let languageId = DefaultLanguage.dataValues.id;
      const language = req.headers.language;
      if (language == langCode && !payload.id) {
        let data = await Models.attributes.create({
          category_id: payload.categoryId,
          type: payload.type,
          isVariation: payload.isVariation,
          costAlterable: payload.costAlterable,
        });

        let attributeId = data.dataValues.id;
        if (data) {
          await Models.attributeContents.create({
            language_id: languageId,
            attribute_id: attributeId,
            name: payload.name,
          });
        }
      } else if (payload.id) {
        let getLanguage = await UniversalFunctions.getLanguage(
          req.headers.language
        );
        if (!getLanguage) {
          getLanguage = DefaultLanguage;
        }
        getLanguage = getLanguage.dataValues.id;

        let data = await Models.attributes.findOne({
          where: {
            id: payload.id,
            isDeleted: 0,
          },
        });

        if (!data) {
          return Boom.badRequest(
            req.i18n.__("NO_ATTRIBUTES_EXIST_WITH_GIVEN_ID")
          );
        }

        if (data) {
          await Models.attributeContents.create({
            language_id: getLanguage,
            attribute_id: payload.id,
            name: payload.name,
          });
        }
      } else {
        return Boom.badRequest(
          req.i18n.__("CONTENT_SHOULD_BE_FIRST_ADDED_IN_DEFAULT_LANGUAGE")
        );
      }

      return h
        .response({
          message: req.i18n.__("ADDED_ATTRIBUTE_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  editAttributes = async (req, h) => {
    try {
      const payload = req.payload;
      let language = await UniversalFunctions.getLanguage(req.headers.language);
      if (!language) {
        language = defaultLanguage;
      }
      language = language.dataValues.id;
      let updateAttributes = {};
      let updateAttributeContents = {};

      if (payload.categoryId) {
        updateAttributes.category_id = payload.categoryId;
      }

      if (payload.type) {
        updateAttributes.type = payload.type;
      }
      if (payload.isVariation || payload.isVariation == 0) {
        updateAttributes.isVariation = payload.isVariation;
      }
      if (payload.costAlterable || payload.costAlterable == 0) {
        updateAttributes.costAlterable = payload.costAlterable;
      }
      if (payload.name) {
        updateAttributeContents.name = payload.name;
      }

      await Models.attributes.update(updateAttributes, {
        where: {
          id: payload.id,
        },
      });

      await Models.attributeContents.update(updateAttributeContents, {
        where: {
          attribute_id: payload.id,
          language_id: language,
        },
      });

      return h
        .response({
          message: req.i18n.__("EDITED_ATTRIBUTE_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  getAttributes = async (req, h) => {
    try {
      const language = req.headers.language;
      const defaultLanguage = DefaultLanguage;
      /*let attribute = await Models.attributes.findAll({
                attributes : ["id", "type", "isVariation","costAlterable"],
                where : {
                   isDeleted : 0
                },
                include :[
                    {
                        where : {isDeleted : 0},
                        required: true,
                        model: Models.attributeContents,
                        include:[{model:Models.languages,required:false,attributes : [],where:{[Op.or]:[{code:language},{code:defaultLanguage.dataValues.code}]}}],
                        attributes : ['id','name'],
                    }
                ]
            }) **/

      let attribute = await Models.sequelize.query(
        `
                    select if(ac.name is null, acd.name,ac.name) as name, if(ac.id is null, acd.id, ac.id ) as contentId,
                    a.id, type, costAlterable, isVariation, a.category_id
                    from attributes as a
                    LEFT JOIN languages as ld on ld.code=?
                    LEFT JOIN attributeContents as acd on (acd.attribute_id = a.id and acd.language_id=ld.id)
                    LEFT JOIN languages as l on l.code=?
                    LEFT JOIN attributeContents as ac on (ac.attribute_id = a.id and ac.language_id=l.id)`,
        {
          replacements: [defaultLanguage.dataValues.code, language],
          type: QueryTypes.SELECT,
        }
      );

      return h
        .response({
          responseData: {
            data: attribute,
          },
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  getAttributeWithId = async (req, h) => {
    try {
      const language = req.headers.languauge;
      const defaultLanguage = DefaultLanguage;
      const payload = req.query;

      let attribute = await Models.sequelize.query(
        `
                    select if(ac.name is null, acd.name,ac.name) as name, if(ac.id is null, acd.id, ac.id ) as contentId,
                    a.id, type, costAlterable, isVariation, a.category_id
                    from attributes as a
                    LEFT JOIN languages as ld on ld.code=?
                    LEFT JOIN attributeContents as acd on (acd.attribute_id = a.id and acd.language_id=ld.id)
                    LEFT JOIN languages as l on l.code=?
                    LEFT JOIN attributeContents as ac on (ac.attribute_id = a.id and ac.language_id=l.id)
                    where a.id = ?`,
        {
          replacements: [defaultLanguage.dataValues.code, language, payload.id],
          type: QueryTypes.SELECT,
        }
      );

      return h
        .response({
          responseData: {
            data: attribute[0],
          },
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  deleteAttributes = async (req, h) => {
    try {
      const payload = req.payload;

      let data = await Models.attributes.update(
        {
          isDeleted: 1,
        },
        {
          where: {
            id: payload.id,
          },
        }
      );

      if (data) {
        await Models.attributeContents.update(
          {
            isDeleted: 1,
          },
          {
            where: {
              attribute_id: payload.id,
            },
          }
        );
      }

      return h
        .response({
          message: req.i18n.__("DELETED_ATTRIBUTE_SUCCESSFULLY"),
        })
        .code(200);
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };
}

module.exports = new Attribute();
