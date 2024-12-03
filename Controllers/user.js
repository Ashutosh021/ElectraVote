const User = require("../models/user");
const { generateToken } = require("../Middlewares/jwt");
const Candidate = require("../models/candidate");

const SignUp = async (req, res) => {
  try {
    const data = req.body;

    // Log received data for debugging
    console.log("Received signup data:", data);

    // Check if all required fields are provided
    if (
      !data.name ||
      !data.aadharCardNumber ||
      !data.age ||
      !data.address ||
      !data.password
    ) {
      res.render("SignUpPage",{ error: "All fields are required." });
    }

    // Check for existing admin user if role is 'admin'
    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      res.render("SignUpPage",{ error: "Admin user already exists" });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadharCardNumber: data.aadharCardNumber,
    });
    if (existingUser) {
      res.render("SignUpPage",{
          error: "User with the same Aadhar Card Number already exists",
        });
    }

    // Create and save the new user
    const newUser = new User(data);
    const response = await newUser.save();

    console.log("User data saved:", response);

    // Generate and send the token
    const payload = { id: response.id };
    const token = generateToken(payload);
    res.cookie("token", token);
    // res.status(200).json({ message: 'Signup successful', token });
    res.render("profile", { user: response });
  } catch (err) {
    console.log(err);
    res.render("SignUpPage",{ error: "Internal Server Error" });
  }
};

const Login = async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    if (!aadharCardNumber || !password) {
      return res.render("LogInPage", {
        error: "Aadhar Card Number and password are required",
      });
    }

    const user = await User.findOne({ aadharCardNumber });

    if (!user || !(await user.comparePassword(password))) {
      return res.render("LogInPage", {
        error: "Invalid Aadhar Card Number or Password",
      });
    }

    const payload = { id: user.id };
    const token = generateToken(payload);
    res.cookie("token", token);

    res.render("profile", { user });
  } catch (err) {
    console.error(err);
    res.render("LogInPage", {
      error: "Something went wrong. Please try again later.",
    });
  }
};


const Logout = (req, res) => {
  res.cookie("token", "");
  res.render("index");
};

const Profile = async (req, res) => {
  try {
    const userData = req.user; 
    console.log(req.user)
    res.render("profile", { user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const votePortal = async (req, res) => {
  try {
      if (!req.user) {
          return res.status(401).send("You must be logged in to vote.");
      }

      const candidates = await Candidate.find({}, "name party _id");

      if (!candidates || candidates.length === 0) {
          return res.status(404).send("No candidates available for voting.");
      }
      const user = req.user;
      res.render("votePortal", { candidates, user });
  } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).send("An error occurred while loading the voting portal.");
  }
};


const Vote = async (req, res) => {
  const { candidateID } = req.params;
  const userId = req.user.id;

  try {
      const [candidate, user] = await Promise.all([
          Candidate.findById(candidateID),
          User.findById(userId),
      ]);

      if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.role === 'admin') return res.status(403).json({ message: 'Admin is not allowed to vote' });
      if (user.isVoted) return res.status(400).json({ message: 'You have already voted' });

      // Update the Candidate and User
      candidate.votes.push({ user: userId });
      candidate.voteCount++;
      await candidate.save();

      user.isVoted = true;
      await user.save();

      const candidates = await Candidate.find().select('name party voteCount');

      res.status(200).json({
          message: 'Vote recorded successfully',
          candidates,
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

const ResetPassword = async (req, res) => {
  try {
    const userId = req.user.id; // Extract the id from the token
    const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

    // Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both currentPassword and newPassword are required" });
    }

    // Find the user by userID
    const user = await User.findById(userId);

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log("password updated");
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  SignUp,
  Login,
  Logout,
  votePortal,
  Vote,
  Profile,
  ResetPassword,
};
