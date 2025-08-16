const cron = require("node-cron");
const userModel = require("../models/userModel");

const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Checking expired subscriptions`);

    // Find and update expired subscriptions
    const result = await userModel.updateMany(
      {
        "subscription.isActive": true,
        "subscription.expiryDate": { $lte: now },
      },
      {
        $set: {
          "subscription.isActive": false,
          "subscription.lastPaymentStatus": "Unpaid",
        },
      }
    );

    console.log(`Deactivated ${result.modifiedCount} expired subscriptions`);
    return result;
  } catch (error) {
    console.error("Subscription check error:", error);
    throw error;
  }
};

// Run every minute
const initSubscriptionCronJob = () => {
  cron.schedule("* * * * *", async () => {
    await checkExpiredSubscriptions();
  });
  console.log(
    "Initialized subscription expiration checker (runs every minute)"
  );
};

module.exports = {
  checkExpiredSubscriptions,
  initSubscriptionCronJob,
};
