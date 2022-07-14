module.exports = [
    {
      method: "GET",
      path: "/resources/attachments/{file*}",
      options: {
        tags: ["api", "Static Content"],
        plugins: {
          "hapi-swagger": {}
        },
        notes: "Access static content",
        description: "Access Static content",
        auth: false
      },
      handler: async (req, h) => {
        let fileSource = "./resources/attachments/" + req.params.file;
        return h.file(fileSource);
      }
    },
    {
      method: "GET",
      path: "/resources/images/{file*}",
      options: {
        tags: ["api", "Static Content"],
        plugins: {
          "hapi-swagger": {}
        },
        notes: "Access static content",
        description: "Access Static content",
        auth: false
      },
      handler: async (req, h) => {
        let fileSource = "./resources/images/" + req.params.file;
        return h.file(fileSource);
      }
    }
  ];
  