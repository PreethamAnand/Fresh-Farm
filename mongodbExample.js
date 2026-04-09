/*
  Install and run (PowerShell):
  1) npm install mongodb dotenv
  2) $env:MONGODB_URI="<your-atlas-connection-string>"; node mongodbExample.js

  If you prefer file-based config instead of env vars, create mongodbExample.config.json
  with: {"MONGODB_URI":"<your-atlas-connection-string>"}
*/

import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

dotenv.config();

const DATABASE_NAME = "farmFreshConnect";
const COLLECTION_NAME = "activityFeed";
const CONFIG_FILE_NAME = "mongodbExample.config.json";

async function readMongoUri() {
  // Environment variables are the safest default for secrets, so we check there first.
  const envUri = process.env.MONGODB_URI?.trim();
  if (envUri) {
    return envUri;
  }

  // Fallback: local config file is useful for quick local testing without changing shell config.
  const configPath = path.resolve(CONFIG_FILE_NAME);

  try {
    const raw = await fs.readFile(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const fileUri = typeof parsed.MONGODB_URI === "string" ? parsed.MONGODB_URI.trim() : "";

    if (fileUri) {
      return fileUri;
    }

    throw new Error(`'MONGODB_URI' is missing or empty in ${CONFIG_FILE_NAME}`);
  } catch (error) {
    throw new Error(
      `Could not load MONGODB_URI from environment or ${CONFIG_FILE_NAME}. ` +
        `Set MONGODB_URI in your environment, or create ${CONFIG_FILE_NAME} with JSON like {\"MONGODB_URI\":\"<your-uri>\"}. ` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function buildActivityFeedSeedData() {
  const now = Date.now();

  // We intentionally offset each timestamp so sorting by time shows a meaningful order.
  const activities = [
    {
      actorId: "user_101",
      actorName: "Ravi",
      action: "posted",
      targetType: "crop_update",
      targetId: "crop_5001",
      message: "Shared a photo of today's tomato harvest.",
      timestamp: new Date(now - 2 * 60 * 1000)
    },
    {
      actorId: "user_102",
      actorName: "Ananya",
      action: "commented",
      targetType: "crop_update",
      targetId: "crop_5001",
      message: "Asked for pesticide-free certification details.",
      timestamp: new Date(now - 6 * 60 * 1000)
    },
    {
      actorId: "user_103",
      actorName: "Vikram",
      action: "liked",
      targetType: "product",
      targetId: "product_301",
      message: "Liked the organic spinach listing.",
      timestamp: new Date(now - 11 * 60 * 1000)
    },
    {
      actorId: "user_104",
      actorName: "Meera",
      action: "ordered",
      targetType: "product",
      targetId: "product_222",
      message: "Placed an order for 5kg of onions.",
      timestamp: new Date(now - 18 * 60 * 1000)
    },
    {
      actorId: "user_105",
      actorName: "Suresh",
      action: "rated",
      targetType: "seller",
      targetId: "seller_009",
      message: "Rated seller FreshFarmHub 5 stars.",
      timestamp: new Date(now - 24 * 60 * 1000)
    },
    {
      actorId: "user_106",
      actorName: "Isha",
      action: "followed",
      targetType: "seller",
      targetId: "seller_015",
      message: "Started following GreenLeaf Organics.",
      timestamp: new Date(now - 33 * 60 * 1000)
    },
    {
      actorId: "user_107",
      actorName: "Karthik",
      action: "posted",
      targetType: "market_alert",
      targetId: "alert_7002",
      message: "Posted that carrot prices dropped in Bengaluru market.",
      timestamp: new Date(now - 41 * 60 * 1000)
    },
    {
      actorId: "user_108",
      actorName: "Priya",
      action: "commented",
      targetType: "market_alert",
      targetId: "alert_7002",
      message: "Asked if wholesale rates are also reduced.",
      timestamp: new Date(now - 49 * 60 * 1000)
    },
    {
      actorId: "user_109",
      actorName: "Arjun",
      action: "saved",
      targetType: "product",
      targetId: "product_412",
      message: "Saved fresh strawberries to wishlist.",
      timestamp: new Date(now - 57 * 60 * 1000)
    },
    {
      actorId: "user_110",
      actorName: "Divya",
      action: "shared",
      targetType: "seller_profile",
      targetId: "seller_021",
      message: "Shared a seller profile with a buying group.",
      timestamp: new Date(now - 66 * 60 * 1000)
    }
  ];

  return activities;
}

async function run() {
  console.log("Step 1/6: Loading MongoDB URI...");
  const uri = await readMongoUri();

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000
  });

  try {
    console.log("Step 2/6: Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("Connected successfully.");

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    console.log(`Using database '${DATABASE_NAME}' and collection '${COLLECTION_NAME}'.`);

    console.log("Step 3/6: Inserting 10 activity feed documents...");
    const seedData = buildActivityFeedSeedData();
    const insertResult = await collection.insertMany(seedData);
    console.log(`Inserted ${insertResult.insertedCount} documents.`);

    console.log("Step 4/6: Reading the 5 most recent activity items...");
    const recentFive = await collection.find({}).sort({ timestamp: -1 }).limit(5).toArray();
    console.log("Most recent 5 documents:");
    console.log(JSON.stringify(recentFive, null, 2));

    console.log("Step 5/6: Reading one full document by _id...");
    const firstInsertedId = insertResult.insertedIds[0];
    const oneDocument = await collection.findOne({ _id: firstInsertedId });

    if (!oneDocument) {
      throw new Error("Document lookup by _id returned no result.");
    }

    console.log("Document fetched by _id:");
    console.log(JSON.stringify(oneDocument, null, 2));
  } catch (error) {
    console.error("MongoDB example failed:");
    console.error(error instanceof Error ? error.message : error);
  } finally {
    console.log("Step 6/6: Closing MongoDB connection...");

    try {
      await client.close();
      console.log("Connection closed.");
    } catch (closeError) {
      console.error("Failed to close MongoDB connection cleanly:");
      console.error(closeError instanceof Error ? closeError.message : closeError);
    }
  }
}

run();
