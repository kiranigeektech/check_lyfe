class Attachment {
  create = async (req, h) => {
    try {
      let file = await UniversalFunctions.handleFileUpload(
        req.payload.uploadfile
      );

      let Attachment = await Models.attachments.create({
        fileName: file.uniqueName,
        filePath: file.filePath,
        thumbnailPath: file.thumbPath,
        originalName: file.originalName,
        size: file.size,
        format: file.extension,
        usageFlag: Constants.ATTACHMENT_USAGE_STATUS.UNUSED,
        type: 1,
      });
      if (Attachment) {
        Attachment["filePath"] =
          process.env.NODE_SERVER_API_HOST + "/" + Attachment["filePath"];
        Attachment["thumbnailPath"] =
          process.env.NODE_SERVER_API_HOST + "/" + Attachment["thumbnailPath"];
        return h.response({ responseData: Attachment }).code(200);
      } else {
        let error = Boom.badRequest(
          req.i18n.__("ERROR_WHILE_SAVING_ATTACHMENT")
        );
        return error;
      }
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

  uploadFile = async (req, h) => {
    try {
      console.log(req.payload.file)
      let file = await UniversalFunctions.handleFileUpload(
        req.payload.file
      );

      let Attachment = await Models.attachments.create({
        fileName: file.uniqueName,
        filePath: file.filePath,
        thumbnailPath: file.thumbPath,
        originalName: file.originalName,
        size: file.size,
        format: file.extension,
        usageFlag: Constants.ATTACHMENT_USAGE_STATUS.UNUSED,
        type: 1,
      });
      if (Attachment) {
        Attachment["filePath"] =
          process.env.NODE_SERVER_API_HOST + "/" + Attachment["filePath"];
        Attachment["thumbnailPath"] =
          process.env.NODE_SERVER_API_HOST + "/" + Attachment["thumbnailPath"];
        return {location:Attachment.filePath};

      } else {
        let error = Boom.badRequest(
          req.i18n.__("ERROR_WHILE_SAVING_ATTACHMENT")
        );
        return error;
      }
    } catch (e) {
      return Boom.badRequest(req.i18n.__("SOMETHING_WENT_WRONG"));
    }
  };

}

module.exports = new Attachment();
