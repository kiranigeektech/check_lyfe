const db = require("../models/index");

class eventHostReview {
  /* getHostReview = async (request) => {
    try {
      const HostReview = await db.eventHostReview.findAll();
      return HostReview;
    } catch (e) {
      console.log("ss", e);
    }
  }; */

 /*  addHostReview = async (request, h) => {
    try {
      let data = request.payload;

      const rating = await db.eventHostReview.create({
        rating: data.rating,
        reviewDesription: data.reviewDesription,
      });

      return rating;
    } catch (e) {
      console.log("##addaminties######", e);
    }
  }; */

 /*  editHostReview = async (request) => {
    try {
      const editAmini = await db.eventHostReview.update(
        {
          HostReviewItem: request.payload.HostReviewItem,
        },
        {
          where: {
            id: request.params.id,
          },
        }
      );
      return editAmini;
    } catch (e) {
      console.log("###edit####", e);
    }
  }; */

 /*  deleteHostReview = async (request) => {
    try {
      const delamini = await db.eventHostReview.destroy({
        where: {
          id: request.payload.id,
        },
      });
      return "Deleted Successfully";
    } catch (e) {
      console.log("@@delete@@@", e);
    }
  }; */
}

module.exports = new eventHostReview();
