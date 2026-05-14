import mongoose from "mongoose";

const atlasDb = mongoose.createConnection(
  `${process.env.ATLAS_URI}/${process.env.ATLAS_DB_NAME}`
);

atlasDb.on("connected", () => {
  console.log(
    `Connected to Atlas DB \n dbhost : ${atlasDb.host}`
  );
});

atlasDb.on("error", (err) => {
  console.log("Atlas DB Connection Error", err.message);
});

export default atlasDb;