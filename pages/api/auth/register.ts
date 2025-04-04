import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists." });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  return res.status(201).json({ message: "User registered successfully." });
}
