// const fs = require("fs");
// const express = require("express");
// const app = express();

// // Importing products from userDetails.json file
// const userDetails = JSON.parse(
//   fs.readFileSync(`${__dirname}/data/userDetails.json`)
// );

// //Middlewares
// app.use(express.json());

// //Write DELETE endpoint for deleting the details of user
// app.delete("/api/v1/details/:id", (req, res) => {
//   const id = Number(req.params["id"]);
//   const product = userDetails.find((product) => product.id === id);
//   console.log(product, 'products');
//   if(!product){
//     res.statusCode = 404;
//     const output = { "status": "failed", "message": "User not found!" };
//     res.send(output);
//   }

//   const index = userDetails.indexOf(product);
//   userDetails.splice(index, 1);
//   fs.writeFile(
//     `${__dirname}/data/userDetails.json`,
//     JSON.stringify(userDetails),
//     (error) => {
//       res.statusCode = 200;
//       const output = {
//         status: "success", 
//         message: "User details deleted successfully",
//         data: {
//           details: product,
//         }
//       }
//       res.send(output);
//     }
//   )
// });

// // PATCH endpoint for editing user details
// app.patch("/api/v1/details/:id", (req, res) => {
//   const id = req.params.id * 1;
//   const updatedDetails = userDetails.find(
//     (updatedDetails) => updatedDetails.id === id
//   );
//   const index = userDetails.indexOf(updatedDetails);
//   if (!updatedDetails) {
//     return res.status(404).send({
//       status: "failed",
//       message: "User not found!",
//     });
//   }

//   Object.assign(updatedDetails, req.body);

//   fs.writeFile(
//     `${__dirname}/data/userDetails.json`,
//     JSON.stringify(userDetails),
//     (err) => {
//       res.status(200).json({
//         status: "success",
//         message: `User details updated successfully for id: ${updatedDetails.id}`,
//         data: {
//           updatedDetails,
//         },
//       });
//     }
//   );
// });

// // POST endpoint for registering new user
// app.post("/api/v1/details", (req, res) => {
//   const newId = userDetails[userDetails.length - 1].id + 1;
//   const { name, mail, number } = req.body;
//   const newUser = { id: newId, name, mail, number };
//   userDetails.push(newUser);
//   fs.writeFile(
//     `${__dirname}/data/userDetails.json`,
//     JSON.stringify(userDetails),
//     (err) => {
//       res.status(201).json({
//         status: "Success",
//         message: "User registered successfully",
//         data: {
//           userDetails: newUser,
//         },
//       });
//     }
//   );
// });

// // GET endpoint for sending the details of users
// app.get("/api/v1/details", (req, res) => {
//   res.status(200).json({
//     status: "Success",
//     message: "Detail of users fetched successfully",
//     data: {
//       userDetails,
//     },
//   });
// });

// // GET endpoint for sending the details of users by id
// app.get("/api/v1/userdetails/:id", (req, res) => {
//   let { id } = req.params;
//   id *= 1;
//   const details = userDetails.find((details) => details.id === id);
//   if (!details) {
//     return res.status(404).send({
//       status: "failed",
//       message: "User not found!",
//     });
//   } else {
//     res.status(200).send({
//       status: "success",
//       message: "Details of users fetched successfully",
//       data: {
//         details,
//       },
//     });
//   }
// });

// module.exports = app;



const fs = require("fs");
const express = require("express");
const app = express();

// Importing products from userDetails.json file
const userDetailsFilePath = `${__dirname}/data/userDetails.json`;

// Read and parse userDetails.json file
let userDetails;
try {
  userDetails = JSON.parse(fs.readFileSync(userDetailsFilePath));
} catch (error) {
  console.error("Failed to read or parse userDetails.json:", error);
  userDetails = [];
}

// Middleware to parse JSON
app.use(express.json());

// DELETE endpoint for deleting the details of a user
app.delete("/api/v1/details/:id", (req, res) => {
  const id = Number(req.params.id);
  const userIndex = userDetails.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ status: "failed", message: "User not found!" });
  }

  const deletedUser = userDetails.splice(userIndex, 1)[0];
  fs.writeFile(userDetailsFilePath, JSON.stringify(userDetails, null, 2), (err) => {
    if (err) {
      console.error("Failed to write to userDetails.json:", err);
      return res.status(500).json({ status: "error", message: "Failed to delete user!" });
    }
    res.status(200).json({
      status: "success",
      message: "User details deleted successfully",
      data: { details: deletedUser },
    });
  });
});

// PATCH endpoint for editing user details
app.patch("/api/v1/details/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = userDetails.find(user => user.id === id);

  if (!user) {
    return res.status(404).json({ status: "failed", message: "User not found!" });
  }

  Object.assign(user, req.body);
  fs.writeFile(userDetailsFilePath, JSON.stringify(userDetails, null, 2), (err) => {
    if (err) {
      console.error("Failed to write to userDetails.json:", err);
      return res.status(500).json({ status: "error", message: "Failed to update user!" });
    }
    res.status(200).json({
      status: "success",
      message: `User details updated successfully for id: ${id}`,
      data: { updatedDetails: user },
    });
  });
});

// POST endpoint for registering a new user
app.post("/api/v1/details", (req, res) => {
  const { name, mail, number } = req.body;
  if (!name || !mail || !number) {
    return res.status(400).json({ status: "failed", message: "Missing required fields!" });
  }

  const newId = (userDetails[userDetails.length - 1]?.id || 0) + 1;
  const newUser = { id: newId, name, mail, number };
  userDetails.push(newUser);

  fs.writeFile(userDetailsFilePath, JSON.stringify(userDetails, null, 2), (err) => {
    if (err) {
      console.error("Failed to write to userDetails.json:", err);
      return res.status(500).json({ status: "error", message: "Failed to register user!" });
    }
    res.status(200).json({
      status: "success",
      message: "User registered successfully",
      data: { userDetails: newUser },
    });
  });
});

// GET endpoint for sending the details of users
app.get("/api/v1/details", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Detail of users fetched successfully",
    data: { userDetails },
  });
});

// GET endpoint for sending the details of a user by id
app.get("/api/v1/userdetails/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = userDetails.find(user => user.id === id);

  if (!user) {
    return res.status(404).json({ status: "failed", message: "User not found!" });
  }

  res.status(200).json({
    status: "success",
    message: "Details of user fetched successfully",
    data: { details: user },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Internal Server Error!" });
});

module.exports = app;

