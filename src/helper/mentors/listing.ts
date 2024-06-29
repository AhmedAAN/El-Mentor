export function matchMentors(matchFilter: any) {
  return {
    $match: matchFilter,
  };
}
export const lookupReviews = {
  $lookup: {
    from: "reviews",
    localField: "_id",
    foreignField: "mentorId",
    as: "reviews",
  },
};

export const averageStars = {
  $addFields: {
    averageStars: { $avg: "$reviews.stars" },
  },
};
export const projection = {
  $project: {
    _id: 1,
    userName: 1,
    imageUrl: 1,
    averageStars: { $ifNull: ["$averageStars", 0] },
    specialization: 1,
    levelOfExperience: 1,
  },
};
