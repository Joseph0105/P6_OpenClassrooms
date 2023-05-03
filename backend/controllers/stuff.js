const dataModelsSauce = require('../models/DataModelsSauce');

exports.createSauce = (req, res, next) => {
  delete req.body._id;
  const sauces = new dataModelsSauce({
    ...req.body,
  });
  sauces
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée' }))
    .catch((error) => res.status(400).json({ error }));
};
