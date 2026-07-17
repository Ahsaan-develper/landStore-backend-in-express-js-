import Interest     from "../models/interest.model.js";
import InterestUser from "../models/interest_user.model.js";

// ───────────────────────────────────────────
// 1. ADD INTEREST
// ───────────────────────────────────────────
export const addInterest = async (req, res) => {
  try {
    const {
      interest_type,
      estimated_budget,
      timeLine,
      role,
      message,
      listing_id,
    } = req.body;

    const user_id = req.user.sub;

    // ✅ check already submitted
    const existing = await InterestUser.findOne({ user_id, listing_id });
    if (existing) throw new BadRequestError("You already submitted interest for this listing");

    // ✅ create interest + tracking doc at same time
    const interest = await Interest.create({
      interest_type,
      estimated_budget,
      timeLine,
      role,
      message,
      listing_id,
      user_id,
      status: "pending",
    });

    await InterestUser.create({
      user_id,
      listing_id,
      interest_id: interest._id,
    });

    res.status(201).json({
      success: true,
      message: "Interest submitted successfully",
      data: interest,
    });

  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    throw new InternalServerError(err.message);
  }
};

// ───────────────────────────────────────────
// 2. CANCEL INTEREST (status change only)
// ───────────────────────────────────────────
export const cancelInterest = async (req, res) => {
  try {
    const { interest_id } = req.params;
    const user_id = req.user.sub;

    const interest = await Interest.findOneAndUpdate(
      {
        _id:    interest_id,
        user_id,                          // ✅ only owner can cancel
        status: { $ne: "cancelled" },     // ✅ skip if already cancelled
      },
      { status: "cancelled" },
      { new: true }
    );

    if (!interest) throw new BadRequestError("Interest not found or already cancelled");

    res.status(200).json({
      success: true,
      message: "Interest cancelled",
      data: interest,
    });

  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    throw new InternalServerError(err.message);
  }
};

// ───────────────────────────────────────────
// 3. UPDATE STATUS (admin only)
// ───────────────────────────────────────────
export const updateInterestStatus = async (req, res) => {
  try {
    const { interest_id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "under_review", "cancelled"];
    if (!allowed.includes(status)) {
      throw new BadRequestError(`Invalid status. Allowed: ${allowed.join(", ")}`);
    }

    const interest = await Interest.findByIdAndUpdate(
      interest_id,
      { status },
      { new: true }
    );

    if (!interest) throw new BadRequestError("Interest not found");

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: interest,
    });

  } catch (err) {
    if (err instanceof BadRequestError) throw err;
    throw new InternalServerError(err.message);
  }
};