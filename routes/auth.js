const router = require("express").Router();

let users = [];

router.post("/signup", (req, res) => {
  const { email, role } = req.body;

  const user = { id: Date.now(), email, role };
  users.push(user);

  res.json(user);
});

router.post("/login", (req, res) => {
  const { email } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ msg: "User not found" });

  res.json(user);
});

module.exports = router;