const router = require("express").Router();

let sessions = [];

router.post("/create", (req, res) => {
  const session = {
    id: Date.now().toString(),
    active: true,
  };

  sessions.push(session);

  res.json(session);
});

router.get("/:id", (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);
  res.json(session);
});

module.exports = router;