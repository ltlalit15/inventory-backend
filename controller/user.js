const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload');  // Specify the folder where images will be stored
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);  // Get file extension
        const fileName = Date.now() + fileExtension;  // Use a unique name
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });


//Register User
const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role = "user" } = req.body;

        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: "false", message: 'User already exists with this email', data: [] });
        }

        // Hash password once
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user (exclude confirmPassword)
        const [result] = await db.query(
            'INSERT INTO user (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword, role]
        );

        // Get new user from DB (excluding confirmPassword from response)
        const [newUser] = await db.query('SELECT * FROM user WHERE id = ?', [result.insertId]);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            status: "true",
            message: 'User registered successfully',
            data: { ...newUser[0], token }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "false", message: 'Server error', data: [] });
    }
};


const editProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role: incomingRole = "user" } = req.body;
        const { userId } = req.params;

        // Check if user exists
        const [user] = await db.query('SELECT * FROM user WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ status: "false", message: 'User not found', data: [] });
        }

        const currentUser = user[0];

        // Hash password only if it's provided
        let hashedPassword = currentUser.password; // keep existing password
        if (password && password.trim() !== "") {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // ✅ Preserve admin role if already admin
        const finalRole = currentUser.role === "admin" ? "admin" : incomingRole;

        // Update user
        await db.query(
            'UPDATE user SET firstName = ?, lastName = ?, email = ?, password = ?, role = ? WHERE id = ?',
            [firstName, lastName, email, hashedPassword, finalRole, userId]
        );

        // Fetch updated user without password
        const [updatedUser] = await db.query(
            'SELECT * FROM user WHERE id = ?',
            [userId]
        );

        // Generate new token
        const token = jwt.sign(
            { id: updatedUser[0].id, email: updatedUser[0].email, role: updatedUser[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            status: "true",
            message: 'User details updated successfully',
            data: { ...updatedUser[0], token }
        });

    } catch (error) {
        console.error("Edit Profile Error:", error);
        res.status(500).json({ status: "false", message: 'Server error', data: [] });
    }
};



// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM user');

        if (users.length === 0) {
            return res.status(404).json({ status: "false", message: "No user found", data: [] });
        }

        res.status(200).json({ status: "true", message: "Users retrieved successfully", data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// // Get User by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        if (user.length === 0) {
            return res.status(404).json({ status: "false", message: "User not found", data: [] });
        }

        res.status(200).json({ status: "true", message: "User retrieved successfully", data: user[0] });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// const checkGoogleDetails = async (req, res) => {
//     try {
//         const { email, googleSignIn, facebookSignIn } = req.body;

//         // Step 1: Validate Email
//         if (!email) {
//             return res.status(400).json({ status: "false", message: "Email is required", data: [] });
//         }

//         // Step 2: Fetch User
//         const [existingUser] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);

//         if (existingUser.length === 0) {
//             return res.status(404).json({ status: "false", message: "User not found with this email.", data: [] });
//         }

//         // Step 3: Prepare update fields dynamically
//         const updateFields = [];
//         const values = [];

//         if (googleSignIn !== undefined) {
//             updateFields.push("googleSignIn = ?");
//             values.push(googleSignIn);
//         }

//         if (facebookSignIn !== undefined) {
//             updateFields.push("facebookSignIn = ?");
//             values.push(facebookSignIn);
//         }

//         // Step 4: Update the user if needed
//         if (updateFields.length > 0) {
//             values.push(email);
//             const updateQuery = `UPDATE user SET ${updateFields.join(", ")} WHERE email = ?`;
//             await db.execute(updateQuery, values);
//         }

//         // Step 5: Fetch Updated User Data (Ensuring Correct Column Name)
//         const [updatedUser] = await db.execute('SELECT id, fullName, email, password, googleSignIn, facebookSignIn FROM user WHERE email = ?', [email]);

//          // Step 6: Generate JWT Token
//         const token = jwt.sign(
//             { id: updatedUser[0].id, email: updatedUser[0].email },
//             process.env.JWT_SECRET,  // Secret Key should be in your .env file
//             { expiresIn: '1h' }  // Token expiry time (1 hour in this case)
//         );

//         return res.status(200).json({
//             status: "true",
//             message: "Google or Facebook details updated successfully",
//             data: {
//                 ...updatedUser[0],  // Updated user details
//                 token: token         // JWT Token
//             }
//         });

//     } catch (error) {
//         console.error("Google/Facebook Sign-In Error:", error);
//         res.status(500).json({ status: "false", message: "Server error", error: error.message });
//     }
// };


// //delete user
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params; 

        const [existingUser] = await db.query('SELECT * FROM user WHERE id = ?', [id]);

        if (existingUser.length === 0) {
            return res.status(404).json({ status: "false", message: "User not found", data: [] });
        }
                
        await db.query('DELETE FROM user WHERE id = ?', [id]);

        res.status(200).json({
            status: "true",
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
};



// const forgotPassword = async (req, res) => {
//     try {
//         const { email, newPassword } = req.body;

//         // Check if user exists
//         const [user] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
//         if (user.length === 0) {
//             return res.status(404).json({ status: "false", message: "User not found with this email." });
//         }

//         // Hash new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update password and confirmPassword
//         await db.query("UPDATE user SET password = ?, confirmPassword = ? WHERE email = ?", 
//             [hashedPassword, hashedPassword, email]);

//         res.status(200).json({ status: "true", message: "Password updated successfully." });

//     } catch (error) {
//         console.error("Forgot Password Error:", error);
//         res.status(500).json({ status: "false", message: "Server error" });
//     }
// };


// const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;

//         // Check if user exists
//         const [user] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
//         if (user.length === 0) {
//             return res.status(404).json({ status: "false", message: "User not found." });
//         }

//         // Password reset is not allowed for Google Sign-In users
//         if (user[0].googleSignIn === "true") {
//             return res.status(400).json({
//                 status: "false",
//                 message: "Password reset is not allowed for Google Sign-In users. Please log in using Google."
//             });
//         }

//         // Generate a unique reset token
//         const resetToken = crypto.randomBytes(32).toString("hex");
//         const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

//         // Save the token in the database
//         await db.query("UPDATE user SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?", 
//                        [resetToken, resetTokenExpiry, email]);

//         // Configure Nodemailer transport
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: 'packageitappofficially@gmail.com',
//                 pass: 'epvuqqesdioohjvi',
//             },
//             tls: {
//                 rejectUnauthorized: false, // This will ignore SSL certificate validation
//             }
//         });

//         // Send the password reset email
//         await transporter.sendMail({
//             from: 'sagar.kiaan12@gmail.com',
//             to: email,
//             subject: "Your Password Reset Token",
//             html: `<p>Your password reset token: <strong>${resetToken}</strong></p>
//                     <p>This token is valid for <strong>15 minutes</strong>.</p>
//                     <p>If you did not request this, please ignore this email.</p>`,
//         });

//         res.status(200).json({ status: "true", message: "Password reset email sent successfully." });

//     } catch (error) {
//         console.error("Forgot Password Error:", error);
//         res.status(500).json({ status: "false", message: "Server error" });
//     }
// };



// const resetPassword = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check karo ki user exist karta hai ya nahi
//         const [user] = await db.query("SELECT * FROM user WHERE email = ?", [email]);

//         if (user.length === 0) {
//             return res.status(404).json({ status: "false", message: "User not found with this email." });
//         }

        
//         if (user[0].googleSignIn === "true") {
//             return res.status(400).json({
//                 status: "false",
//                 message: "Password reset is not allowed for Google sign-in users. Please use Google to log in."
//             });
//         }

//         // Naya password hash karo
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Password update karo
//         await db.query("UPDATE user SET password = ? WHERE email = ?", [hashedPassword, email]);

//         res.status(200).json({ status: "true", message: "Password reset successfully." });

//     } catch (error) {
//         console.error("Reset Password Error:", error);
//         res.status(500).json({ status: "false", message: "Server error" });
//     }
// };


// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [user] = await db.query('SELECT id, email, role, password FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ status: "false", message: 'Invalid email or password', data: [] });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ status: "false", message: 'Invalid email or password', data: [] });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user[0].id, email: user[0].email,  role: user[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        // Prepare response data (including password)
        const userData = {
            id: user[0].id.toString(),
            email: user[0].email,
            password: user[0].password,
            role: user[0].role, 
            token: token
        };

        res.json({ status: "true", message: 'Login successful', data: userData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Protected Route
const protectedRoute = (req, res) => {
    res.json({ message: 'You have accessed a protected route!', user: req.user });
    
};


// Export the functions
module.exports = { login, signUp, getAllUsers, getUserById, editProfile, deleteUserById,  protectedRoute };
