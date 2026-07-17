import folderModel from "../models/folder.model.js";
import folderListingModel from "../models/folderListing.model.js";


// ✅ create folder
export const createFolder = async (req, res) => {
  const { name } = req.body;
  const user_id = req.user.sub;

  const folder = await folderModel.create({ name, user_id });

  res.status(201).json({ success: true, data: folder });
};

// ✅ get all folders of user (with item count)
export const getFolders = async (req, res) => {
  const user_id = req.user.sub;

  const folders = await folderListingModel.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(user_id) } },
    {
      $lookup: {
        from:         "shortlistitems",
        localField:   "_id",
        foreignField: "folder_id",
        as:           "items",
      },
    },
    {
      $project: {
        name:       1,
        createdAt:  1,
        item_count: { $size: "$items" },
      },
    },
  ]);

  res.status(200).json({ success: true, data: folders });
};

// add listing to folder
export const addToFolder = async (req, res) => {
  const { folder_id, listing_id } = req.body;
  const user_id = req.user.sub;

  // check folder belongs to user
  const folder = await folderListingModel.findOne({ _id: folder_id, user_id });
  if (!folder) throw new BadRequestError("Folder not found");

  // insertOne — unique index prevents duplicate
  const item = await folderListingModel.create({ folder_id, listing_id, user_id });

  res.status(201).json({ success: true, data: item });
};

// get all listings inside a folder
export const getFolderItems = async (req, res) => {
  const { folder_id } = req.params;
  const user_id = req.user.sub;

  const items = await folderListingModel.find({ folder_id, user_id })
    .populate("listing_id"); // ← full listing data

  res.status(200).json({ success: true, count: items.length, data: items });
};

// remove listing from folder
export const removeFromFolder = async (req, res) => {
  const { folder_id, listing_id } = req.body;
  const user_id = req.user.sub;

  await folderListingModel.findOneAndDelete({ folder_id, listing_id, user_id });

  res.status(200).json({ success: true, message: "Removed from shortlist" });
};


export const deleteFolder = async (req, res) => {
  const { folder_id } = req.params;
  const user_id = req.user.sub;

  await Promise.all([
    folderListingModel.findOneAndDelete({ _id: folder_id, user_id }),
    folderListingModel.deleteMany({ folder_id }),
  ]);

  res.status(200).json({ success: true, message: "Folder deleted" });
};