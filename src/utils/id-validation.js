const isValidId = (_id, res) => {
  if (_id.length !== 24) {
    res.status(404).send({ error: "Wrong Id" });
    console.log(`"Wrong Id"`);
    return false;
  }
  return true;
};

module.exports = isValidId;
